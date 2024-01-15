import { IsString, IsOptional, IsIn, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const SortBy = ['asc', 'desc'] as const;
type SortByType = typeof SortBy[number];

export class QueryParamsDto {
  @ApiProperty({
    description: 'user name',
    example: 'Chuck',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Sort by asc, desc',
    example: 'asc',
    enum: SortBy,
  })
  @IsOptional()
  @IsIn(SortBy)
  @IsString()
  sortBy?: SortByType;

  @ApiProperty({
    description: 'Order by some attribute',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;
}

export class UserCreateQueryDto {
  @ApiProperty({
    description: 'user name',
    example: 'Chuck',
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'email',
    example: 'chuck@norris.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string
}
