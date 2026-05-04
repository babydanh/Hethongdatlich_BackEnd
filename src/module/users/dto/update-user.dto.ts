import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Bạn có thể thêm các trường chỉ dành riêng cho việc cập nhật ở đây nếu muốn
}
