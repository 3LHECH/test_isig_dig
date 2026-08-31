using CommercialManagement.API.DTOs;

namespace CommercialManagement.API.Interfaces;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAllAsync();
    Task<OrderResponseDto?> GetByIdAsync(int id);
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto);
    Task<bool> ValidateOrderAsync(int id);
    Task<bool> CancelOrderAsync(int id);
}