using CommercialManagement.API.DTOs;
using CommercialManagement.API.Models;

namespace CommercialManagement.API.Interfaces;

public interface IClientService
{
    Task<IEnumerable<ClientResponseDto>> GetAllAsync();
    Task<ClientResponseDto?> GetByIdAsync(int id);
    Task<Client?> GetByEmailAsync(string email); 
    Task<ClientResponseDto> CreateAsync(CreateClientDto dto);
    Task<bool> UpdateAsync(int id, UpdateClientDto dto);
    Task<bool> DeleteAsync(int id);
    Task<ClientDto> CreateAsync(CreateClientDto dto);
}