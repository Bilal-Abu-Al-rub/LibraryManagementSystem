using System.Linq;
using System.Threading.Tasks;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public MembersController(IApplicationDbContext context)
        {
            _context = context;
        }

        // جلب جميع المستعيرين (الأعضاء)
        [HttpGet]
        public async Task<IActionResult> GetMembers()
        {
            var members = await _context.Members
                .AsNoTracking()
                .Select(m => new 
                {
                    m.Id,
                    m.Name,
                    m.MembershipNumber,
                    m.JoinDate,
                    m.UserId
                })
                .ToListAsync();

            return Ok(new { data = members });
        }
    }
}