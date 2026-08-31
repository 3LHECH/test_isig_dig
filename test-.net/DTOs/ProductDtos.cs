using System.ComponentModel.DataAnnotations;

namespace CommercialManagement.API.DTOs;

public record ProductResponseDto(
    int Id,
    string Reference,
    string Name,
    string Description,
    decimal UnitPriceHT,
    int StockQuantity,
    DateTime CreatedAt
);

public record CreateProductDto(
    [Required, MaxLength(50)] string Reference,
    [Required, MaxLength(150)] string Name,
    [MaxLength(500)] string Description,
    [Range(0.01, 9999999.99)] decimal UnitPriceHT,
    [Range(0, int.MaxValue)] int StockQuantity
);

public record UpdateProductDto(
    [Required, MaxLength(50)] string Reference,
    [Required, MaxLength(150)] string Name,
    [MaxLength(500)] string Description,
    [Range(0.01, 9999999.99)] decimal UnitPriceHT,
    [Range(0, int.MaxValue)] int StockQuantity
);