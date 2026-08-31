using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CommercialManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetAll()
    {
        var clients = await _clientService.GetAllAsync();
        return Ok(clients);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientResponseDto>> GetById(int id)
    {
        var client = await _clientService.GetByIdAsync(id);
        if (client is null) return NotFound(new { message = $"Client with ID {id} was not found." });

        return Ok(client);
    }

    [HttpPost]
    public async Task<ActionResult<ClientResponseDto>> Create(CreateClientDto dto)
    {
        var createdClient = await _clientService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = createdClient.Id }, createdClient);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateClientDto dto)
    {
        var success = await _clientService.UpdateAsync(id, dto);
        if (!success) return NotFound(new { message = $"Client with ID {id} was not found." });

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _clientService.DeleteAsync(id);
        if (!success) return NotFound(new { message = $"Client with ID {id} was not found." });

        return NoContent();
    }
}