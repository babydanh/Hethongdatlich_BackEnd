import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users (Quản lý người dùng)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Đăng ký người dùng mới', description: 'Tạo tài khoản và profile đi kèm' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo thành công' })
  async create(@Body() userData: CreateUserDto) {
    return await this.usersService.create(userData);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng', description: 'Hỗ trợ phân trang để tối ưu hiệu năng' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi mỗi trang' })
  @ApiQuery({ name: 'offset', required: false, example: 0, description: 'Vị trí bắt đầu lấy' })
  async findAll(@Query('limit') limit: string, @Query('offset') offset: string) {
    return await this.usersService.getAllUsers(Number(limit) || 10, Number(offset) || 0);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Tìm người dùng theo Email' })
  @ApiParam({ name: 'email', example: 'test@gmail.com' })
  async getByEmail(@Param('email') email: string) {
    return await this.usersService.findByEmail(email);
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Cập nhật thông tin theo UID' })
  @ApiParam({ name: 'uid', description: 'Mã định danh duy nhất của user' })
  async update(@Param('uid') uid: string, @Body() updateData: UpdateUserDto) {
    return await this.usersService.updateProfileUid(uid, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng (Xóa mềm)' })
  @ApiParam({ name: 'id', example: 1 })
  async remove(@Param('id') id: string) {
    return await this.usersService.deleteUser(Number(id));
  }
}
