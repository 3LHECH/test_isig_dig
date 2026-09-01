using CommercialManagement.API.Data;
using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using CommercialManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CommercialManagement.API.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrderResponseDto>> GetAllAsync()
    {
        return await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.OrderLines)
                .ThenInclude(ol => ol.Product)
            .Select(o => MapToResponseDto(o))
            .ToListAsync();
    }

    public async Task<OrderResponseDto?> GetByIdAsync(int id)
    {
        var o = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.OrderLines)
                .ThenInclude(ol => ol.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        return o is null ? null : MapToResponseDto(o);
    }

    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId)
            ?? throw new KeyNotFoundException($"Client with ID {dto.ClientId} not found.");

        if (dto.OrderLines is null || !dto.OrderLines.Any())
        {
            throw new InvalidOperationException("An order must contain at least one order line.");
        }

        var productIds = dto.OrderLines.Select(l => l.ProductId).Distinct().ToList();
        var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

        foreach (var item in dto.OrderLines)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId)
                ?? throw new KeyNotFoundException($"Product with ID {item.ProductId} not found.");

            if (product.StockQuantity < item.Quantity)
            {
                throw new InvalidOperationException(
                    $"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}, Requested: {item.Quantity}."
                );
            }
        }

        var order = new Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..4]}",
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.Draft,
            ClientId = dto.ClientId
        };

        decimal totalHT = 0;

        foreach (var item in dto.OrderLines)
        {
            var product = products.First(p => p.Id == item.ProductId);

            decimal lineTotal = product.UnitPriceHT * item.Quantity;
            totalHT += lineTotal;

            order.OrderLines.Add(new OrderLine
            {
                ProductId = product.Id,
                UnitPrice = product.UnitPriceHT,
                Quantity = item.Quantity,
                LineTotal = lineTotal
            });
        }

        order.TotalHT = totalHT;
        order.TotalTTC = totalHT * (1 + (dto.TaxRatePercentage / 100));

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(order.Id))!;
    }

    public async Task<bool> ValidateOrderAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderLines)
                .ThenInclude(ol => ol.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null || order.Status != OrderStatus.Draft) return false;

        // Verify stock sufficiency
        foreach (var line in order.OrderLines)
        {
            if (line.Product.StockQuantity < line.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for product '{line.Product.Name}'. Stock: {line.Product.StockQuantity}, Requested: {line.Quantity}");
            }
        }

        // Deduct stock
        foreach (var line in order.OrderLines)
        {
            line.Product.StockQuantity -= line.Quantity;
        }

        order.Status = OrderStatus.Validated;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelOrderAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null || order.Status == OrderStatus.Cancelled) return false;

        // Restock products if order was previously validated
        if (order.Status == OrderStatus.Validated)
        {
            var lines = await _context.OrderLines.Include(l => l.Product).Where(l => l.OrderId == id).ToListAsync();
            foreach (var line in lines)
            {
                line.Product.StockQuantity += line.Quantity;
            }
        }

        order.Status = OrderStatus.Cancelled;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteOrderAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null) return false;

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }
    private static OrderResponseDto MapToResponseDto(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.OrderDate,
        o.Status,
        o.TotalHT,
        o.TotalTTC,
        o.ClientId,
        $"{o.Client.FirstName} {o.Client.LastName}",
        o.OrderLines.Select(ol => new OrderLineResponseDto(
            ol.Id, ol.ProductId, ol.Product.Name, ol.Quantity, ol.UnitPrice, ol.LineTotal
        )).ToList()
    );
    
    public async Task<bool> UpdateAsync(int id, UpdateOrderDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.OrderLines)
            .FirstOrDefaultAsync(o => o.Id == id);

    if (order == null || order.Status != OrderStatus.Draft)
    {
        return false; // Cannot update non-existent or validated order
    }

    // Verify client exists
    var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId);
    if (!clientExists)
    {
        throw new KeyNotFoundException($"Client with ID {dto.ClientId} not found.");
    }

    if (dto.OrderLines is null || !dto.OrderLines.Any())
    {
        throw new InvalidOperationException("An order must contain at least one order line.");
    }

    // Load and validate all referenced products
    var productIds = dto.OrderLines.Select(l => l.ProductId).Distinct().ToList();
    var products = await _context.Products
        .Where(p => productIds.Contains(p.Id))
        .ToDictionaryAsync(p => p.Id);

    foreach (var line in dto.OrderLines)
    {
        if (!products.TryGetValue(line.ProductId, out var product))
        {
            throw new KeyNotFoundException($"Product with ID {line.ProductId} not found.");
        }

        if (product.StockQuantity < line.Quantity)
        {
            throw new InvalidOperationException(
                $"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}, Requested: {line.Quantity}."
            );
        }
    }

    // Update ClientId
    order.ClientId = dto.ClientId;

    // Clear existing order lines
    order.OrderLines.Clear();

    decimal newTotalHT = 0;

    // Re-populate order lines from DTO
    foreach (var dtoLine in dto.OrderLines)
    {
        var product = products[dtoLine.ProductId];
        decimal lineTotal = product.UnitPriceHT * dtoLine.Quantity;
        newTotalHT += lineTotal;

        order.OrderLines.Add(new OrderLine
        {
            ProductId = product.Id,
            Quantity = dtoLine.Quantity,
            UnitPrice = product.UnitPriceHT,
            LineTotal = lineTotal
        });
    }

    // Recalculate totals
    order.TotalHT = newTotalHT;
    order.TotalTTC = newTotalHT * (1 + (dto.TaxRatePercentage / 100.0m));

    await _context.SaveChangesAsync();
    return true;
    }
}