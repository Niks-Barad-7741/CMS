using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToResponseDto);
        }

        public async Task<ServiceResult<UserResponseDto>> GetByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ServiceResult<UserResponseDto>.Fail("User not found.");
            }
            return ServiceResult<UserResponseDto>.Ok(MapToResponseDto(user));
        }

        public async Task<ServiceResult<UserResponseDto>> CreateAsync(CreateUserDto dto)
        {
            if (dto.Role == "Client" && dto.OrganizationId == null)
            {
                return ServiceResult<UserResponseDto>.Fail("Client users must belong to an organization.");
            }

            if (dto.Role == "Admin" && dto.OrganizationId != null)
            {
                return ServiceResult<UserResponseDto>.Fail("Admin users cannot belong to an organization.");
            }

            var lowerEmail = dto.Email.ToLowerInvariant();
            if (await _userRepository.EmailExistsAsync(lowerEmail))
            {
                return ServiceResult<UserResponseDto>.Fail("Email address already exists.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Email = lowerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                OrganizationId = dto.OrganizationId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return ServiceResult<UserResponseDto>.Ok(MapToResponseDto(user));
        }

        public async Task<ServiceResult<UserResponseDto>> UpdateAsync(Guid id, UpdateUserDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ServiceResult<UserResponseDto>.Fail("User not found.");
            }

            if (dto.Role == "Client" && dto.OrganizationId == null)
            {
                return ServiceResult<UserResponseDto>.Fail("Client users must belong to an organization.");
            }

            if (dto.Role == "Admin" && dto.OrganizationId != null)
            {
                return ServiceResult<UserResponseDto>.Fail("Admin users cannot belong to an organization.");
            }

            var lowerEmail = dto.Email.ToLowerInvariant();
            if (user.Email.ToLowerInvariant() != lowerEmail)
            {
                if (await _userRepository.EmailExistsAsync(lowerEmail))
                {
                    return ServiceResult<UserResponseDto>.Fail("Email address already exists.");
                }
            }

            user.Name = dto.Name;
            user.Email = lowerEmail;
            user.Role = dto.Role;
            user.OrganizationId = dto.OrganizationId;
            user.IsActive = dto.IsActive;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return ServiceResult<UserResponseDto>.Ok(MapToResponseDto(user));
        }

        public async Task<ServiceResult<bool>> DeleteAsync(Guid id, string currentUserId)
        {
            if (id.ToString() == currentUserId)
            {
                return ServiceResult<bool>.Fail("Admin cannot delete himself.");
            }

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ServiceResult<bool>.Fail("User not found.");
            }

            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }

        private UserResponseDto MapToResponseDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                OrganizationId = user.OrganizationId,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
