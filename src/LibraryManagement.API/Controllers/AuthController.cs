using System;
using System.Linq;
using System.Threading.Tasks;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Application.DTOs.Auth;
using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IApplicationDbContext _context;

        public AuthController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IJwtTokenGenerator tokenGenerator,
            IApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenGenerator = tokenGenerator;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return Conflict(new { message = "Email is already registered." });

            var user = new IdentityUser { UserName = dto.Email, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync(dto.Role))
                await _roleManager.CreateAsync(new IdentityRole(dto.Role));

            await _userManager.AddToRoleAsync(user, dto.Role);

            if (dto.Role == "Member")
            {
                var member = new Member
                {
                    Name = dto.Name,
                    MembershipNumber = "MEM-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                    JoinDate = DateTime.UtcNow,
                    UserId = user.Id
                };
                _context.Members.Add(member);
                await _context.SaveChangesAsync();
            }

            var token = _tokenGenerator.GenerateToken(user, dto.Role);
            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = dto.Role,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized(new { message = "Invalid email or password." });

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Member";

            var token = _tokenGenerator.GenerateToken(user, role);
            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email!,
                Role = role,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            });
        }
    }
}