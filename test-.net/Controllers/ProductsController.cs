using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CommercialManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetAll()
    {
        return Ok(await _productService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product is null) return NotFound(new { message = $"Product with ID {id} not found." });
        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponseDto>> Create([FromBody] CreateProductDto dto)
    {
        var created = await _productService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var success = await _productService.UpdateAsync(id, dto);
        if (!success) return NotFound(new { message = $"Product with ID {id} not found." });
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _productService.DeleteAsync(id);
        if (!success) return NotFound(new { message = $"Product with ID {id} not found." });
        return NoContent();
    }
}