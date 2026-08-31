using CommercialManagement.API.Data;
using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using CommercialManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CommercialManagement.API.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync()
    {
        return await _context.Products
            .Select(p => new ProductResponseDto(
                p.Id, p.Reference, p.Name, p.Description, p.UnitPriceHT, p.StockQuantity, p.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id)
    {
        var p = await _context.Products.FindAsync(id);
        if (p is null) return null;

        return new ProductResponseDto(p.Id, p.Reference, p.Name, p.Description, p.UnitPriceHT, p.StockQuantity, p.CreatedAt);
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Reference = dto.Reference,
            Name = dto.Name,
            Description = dto.Description,
            UnitPriceHT = dto.UnitPriceHT,
            StockQuantity = dto.StockQuantity,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return new ProductResponseDto(product.Id, product.Reference, product.Name, product.Description, product.UnitPriceHT, product.StockQuantity, product.CreatedAt);
    }

    public async Task<bool> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return false;

        product.Reference = dto.Reference;
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.UnitPriceHT = dto.UnitPriceHT;
        product.StockQuantity = dto.StockQuantity;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}