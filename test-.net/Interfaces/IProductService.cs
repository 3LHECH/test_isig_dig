using CommercialManagement.API.DTOs;

namespace CommercialManagement.API.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync();
    Task<ProductResponseDto?> GetByIdAsync(int id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<bool> UpdateAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteAsync(int id);
}