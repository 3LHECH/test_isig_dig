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
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<ClientResponseDto?> GetByIdAsync(int id)
    {
        var c = await _context.Clients.FindAsync(id);
        if (c is null) return null;

        return MapToDto(c);
    }

    public async Task<Client?> GetByEmailAsync(string email)
    {
        return await _context.Clients.FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<ClientResponseDto> CreateAsync(CreateClientDto dto)
    {
        // Check if the email is already registered (case-insensitive check recommended)
        var emailExists = await _context.Clients
            .AnyAsync(c => c.Email.ToLower() == dto.Email.ToLower());

        if (emailExists)
        {
            throw new InvalidOperationException($"A client with the email '{dto.Email}' already exists.");
        }

        var client = new Client
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            client.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return MapToDto(client);
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

    private static ClientResponseDto MapToDto(Client c) =>
        new(c.Id, c.LastName, c.FirstName, c.Email, c.Phone, c.Address, c.CreatedAt);
}