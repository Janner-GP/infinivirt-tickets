import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { ClientsService } from '../application/clients.service';
import { ClientResponseDto } from './dto/client-response.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Crear un cliente (Administrador y Supervisor)' })
  async create(@Body() dto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientsService.create(dto);
    return new ClientResponseDto(client);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.AGENT)
  @ApiOperation({ summary: 'Listar clientes' })
  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientsService.findAll();
    return clients.map((client) => new ClientResponseDto(client));
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.AGENT)
  @ApiOperation({ summary: 'Ver detalle de un cliente' })
  async findOne(@Param('id') id: string): Promise<ClientResponseDto> {
    const client = await this.clientsService.findById(id);
    return new ClientResponseDto(client);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Editar un cliente (Administrador y Supervisor)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientsService.update(id, dto);
    return new ClientResponseDto(client);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Eliminar un cliente (Administrador y Supervisor)' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.clientsService.delete(id);
    return { message: 'Cliente eliminado correctamente' };
  }
}
