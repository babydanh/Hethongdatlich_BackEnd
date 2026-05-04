import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as usersSchema from '../module/users/entities/user.entity';
import * as categoriesSchema from '../module/categories/entities/category.entity';
import * as merchantsSchema from '../module/merchants/entities/merchant.entity';
import * as servicesSchema from '../module/services/entities/service.entity';
import * as bookingsSchema from '../module/bookings/entities/booking.entity';
import * as reviewsSchema from '../module/reviews/entities/review.entity';
import * as administrativeSchema from '../module/administrative/entities/administrative.entity';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = `postgres://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}`;
        console.log(
          `🔌 Database: ${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}`,
        );
        const queryClient = postgres(connectionString);
        return drizzle(queryClient, {
          schema: {
            ...usersSchema,
            ...categoriesSchema,
            ...merchantsSchema,
            ...servicesSchema,
            ...bookingsSchema,
            ...reviewsSchema,
            ...administrativeSchema,
          },
        });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
