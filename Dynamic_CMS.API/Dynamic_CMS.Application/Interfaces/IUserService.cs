using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDto>> GetAllAsync();
        Task<ServiceResult<UserResponseDto>> GetByIdAsync(Guid id);
        Task<ServiceResult<UserResponseDto>> CreateAsync(CreateUserDto dto);
        Task<ServiceResult<UserResponseDto>> UpdateAsync(Guid id, UpdateUserDto dto);
        Task<ServiceResult<bool>> DeleteAsync(Guid id, string currentUserId);
    }
}
