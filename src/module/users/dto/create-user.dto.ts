import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'danh@gmail.com', description: 'Địa chỉ email dùng để đăng nhập', required: true })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại liên lạc', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @ApiProperty({ example: 'Password123!', description: 'Mật khẩu tối thiểu 6 ký tự', required: true })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 3, description: 'ID của Role (1: Admin, 2: Merchant, 3: Customer)', required: true })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ example: 'Trần Thành Danh', description: 'Họ và tên đầy đủ của người dùng', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Link ảnh đại diện' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '2005-12-27', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ example: 'Male', description: 'Giới tính' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'Tôi là lập trình viên NestJS', description: 'Tiểu sử ngắn' })
  @IsString()
  @IsOptional()
  bio?: string;
}
