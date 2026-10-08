using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using LibraryManagement.Infrastructure.Persistence;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. إضافة قاعدة البيانات (SQL Server) بنفس السلسلة الموجودة لديك
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IApplicationDbContext>(provider => 
    provider.GetRequiredService<ApplicationDbContext>());

// 2. إضافة خدمات Identity لدعم تسجيل الدخول في الموقع (Cookies بدلاً من JWT)
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// 3. إضافة خدمات الـ MVC (Controllers + Views)
builder.Services.AddControllersWithViews();

// 4. الخدمات المساندة
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

var app = builder.Build();

// 5. إعداد البيئة والـ Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // مهم جداً لتحميل ملفات الـ CSS والـ JS للتصميم

app.UseRouting();

// تفعيل تسجيل الدخول والصلاحيات
app.UseAuthentication();
app.UseAuthorization();

// 6. إعداد مسار التوجيه الافتراضي لصفحات الـ Razor
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Books}/{action=Index}/{id?}");

app.Run();