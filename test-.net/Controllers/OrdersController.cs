using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CommercialManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetAll()
    {
        return Ok(await _orderService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponseDto>> GetById(int id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order is null) return NotFound(new { message = $"Order with ID {id} not found." });
        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> Create([FromBody] CreateOrderDto dto)
    {
        try
        {
            var created = await _orderService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/validate")]
    public async Task<IActionResult> ValidateOrder(int id)
    {
        try
        {
            var success = await _orderService.ValidateOrderAsync(id);
            if (!success) return BadRequest(new { message = $"Order with ID {id} cannot be validated (must be in Draft status)." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var success = await _orderService.CancelOrderAsync(id);
        if (!success) return BadRequest(new { message = $"Order with ID {id} cannot be cancelled." });
        return NoContent();
    }
}