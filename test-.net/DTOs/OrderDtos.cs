using System.ComponentModel.DataAnnotations;
using CommercialManagement.API.Models;

namespace CommercialManagement.API.DTOs;

public record OrderLineResponseDto(
    int Id,
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal
);

public record OrderResponseDto(
    int Id,
    string OrderNumber,
    DateTime OrderDate,
    OrderStatus Status,
    decimal TotalHT,
    decimal TotalTTC,
    int ClientId,
    string ClientName,
    List<OrderLineResponseDto> OrderLines
);

public record CreateOrderLineDto(
    [Required] int ProductId,
    [Range(1, int.MaxValue)] int Quantity
);

public record CreateOrderDto(
    [Required] int ClientId,
    [Required, MinLength(1)] List<CreateOrderLineDto> OrderLines,
    [Range(0, 100)] decimal TaxRatePercentage = 19.0m // Default VAT rate (19%)
);