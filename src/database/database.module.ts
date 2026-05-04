import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as usersSchema from '../module/users/entities/user.entity';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = `postgres://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}`;
        console.log(`🔌 Database connected to: ${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}`);
        const queryClient = postgres(connectionString);
        return drizzle(queryClient, { schema: { ...usersSchema } });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
