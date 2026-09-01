using BCrypt.Net;
using CommercialManagement.API.Data;
using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using CommercialManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CommercialManagement.API.Services;

public class ClientService : IClientService
{
    private readonly ApplicationDbContext _context;

    public ClientService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync()
    {
        return await _context.Clients
            .Select(c => new ClientResponseDto(
                c.Id,
                c.LastName,
                c.FirstName,
                c.Email,
                c.Phone,
                c.Address,
                c.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<ClientResponseDto?> GetByIdAsync(int id)
    {
        var c = await _context.Clients.FindAsync(id);
        if (c is null) return null;

        return new ClientResponseDto(c.Id, c.LastName, c.FirstName, c.Email, c.Phone, c.Address, c.CreatedAt);
    }

    public async Task<Client?> GetByEmailAsync(string email)
    {
        return await _context.Clients.FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<ClientResponseDto> CreateAsync(CreateClientDto dto)
    {
        var client = new Client
        {
            LastName = dto.LastName,
            FirstName = dto.FirstName,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return new ClientResponseDto(
            client.Id,
            client.LastName,
            client.FirstName,
            client.Email,
            client.Phone,
            client.Address,
            client.CreatedAt
        );
    }

    public async Task<bool> UpdateAsync(int id, UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client is null) return false;

        client.LastName = dto.LastName;
        client.FirstName = dto.FirstName;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Address = dto.Address;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            client.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client is null) return false;

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return true;
    }
}