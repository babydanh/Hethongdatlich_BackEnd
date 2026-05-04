import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../database/database.module';
import * as schema from './entities/user.entity';
import { users, profiles } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Đăng ký người dùng mới
  async create(userData: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await this.db.transaction(async (tx) => {
      // 1. Tạo bản ghi trong bảng users
      const [newUser] = await tx
        .insert(users)
        .values({
          email: userData.email,
          phone: userData.phone,
          passwordHash: hashedPassword,
          roleId: userData.roleId,
        })
        .returning();

      // 2. Tạo bản ghi trong bảng profiles tương ứng
      await tx.insert(profiles).values({
        userId: newUser.id,
        fullName: userData.fullName,
        avatarUrl: userData.avatarUrl,
        dob: userData.dob,
        gender: userData.gender,
        bio: userData.bio,
      });

      return await this.findById(newUser.id);
    });
  }

  // Tìm user theo Email
  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        profile: true,
        role: true,
      },
    });
  }

  // Tìm user theo Id
  async findById(id: number) {
    return await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        profile: true,
        role: true,
      },
    });
  }

  // Tìm user theo UID
  async findByUid(uid: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.uid, uid),
      with: {
        profile: true,
        role: true,
      },
    });
  }

  // Lấy tất cả người dùng (Phân trang)
  async getAllUsers(limit: number = 10, offset: number = 0) {
    return await this.db.query.users.findMany({
      limit,
      offset,
      with: {
        profile: true,
        role: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  // Cập nhật thông tin Profile theo id
  async updateProfileId(userId: number, updateData: Partial<CreateUserDto>) {
    return await this.db.transaction(async (tx) => {
      // 1. Cập nhật bảng users (Những trường có thể thay đổi)
      if (updateData.phone || updateData.email) {
        await tx
          .update(users)
          .set({
            ...(updateData.phone && { phone: updateData.phone }),
            ...(updateData.email && { email: updateData.email }),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      // 2. Cập nhật bảng profiles
      await tx
        .update(profiles)
        .set({
          ...(updateData.fullName && { fullName: updateData.fullName }),
          ...(updateData.avatarUrl && { avatarUrl: updateData.avatarUrl }),
          ...(updateData.dob && { dob: updateData.dob }),
          ...(updateData.gender && { gender: updateData.gender }),
          ...(updateData.bio && { bio: updateData.bio }),
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId));

      return await this.findById(userId);
    });
  }

  // Cập nhật thông tin Profile theo uid
  async updateProfileUid(uid: string, updateData: Partial<CreateUserDto>) {
    // 1. Tìm User để lấy ID nội bộ (Vì bảng Profiles dùng userId là số nguyên)
    const user = await this.findByUid(uid);
    if (!user) return null;

    // 2. Gọi lại hàm update theo ID để thực hiện cập nhật
    return await this.updateProfileId(user.id, updateData);
  }

  // Xóa mềm người dùng
  async deleteUser(id: number) {
    return await this.db
      .update(users)
      .set({
        deletedAt: new Date(),
        isActive: false,
      })
      .where(eq(users.id, id))
      .returning();
  }
}
