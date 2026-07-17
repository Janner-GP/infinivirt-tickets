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
import { AssignmentRulesService } from '../application/assignment-rules.service';
import { AssignmentRuleResponseDto } from './dto/assignment-rule-response.dto';
import { CreateAssignmentRuleDto } from './dto/create-assignment-rule.dto';
import { UpdateAssignmentRuleDto } from './dto/update-assignment-rule.dto';

@ApiTags('assignment-rules')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('assignment-rules')
export class AssignmentRulesController {
  constructor(
    private readonly assignmentRulesService: AssignmentRulesService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Configurar el agente responsable de una subcategoría (solo Administrador)',
  })
  async create(
    @Body() dto: CreateAssignmentRuleDto,
  ): Promise<AssignmentRuleResponseDto> {
    const rule = await this.assignmentRulesService.create(
      dto.subcategoryId,
      dto.agentId,
    );
    return new AssignmentRuleResponseDto(rule);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar reglas de asignación automática (solo Administrador)',
  })
  async findAll(): Promise<AssignmentRuleResponseDto[]> {
    const rules = await this.assignmentRulesService.findAll();
    return rules.map((rule) => new AssignmentRuleResponseDto(rule));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cambiar el agente responsable de una regla (solo Administrador)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentRuleDto,
  ): Promise<AssignmentRuleResponseDto> {
    const rule = await this.assignmentRulesService.update(id, dto.agentId);
    return new AssignmentRuleResponseDto(rule);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una regla de asignación (solo Administrador)',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.assignmentRulesService.delete(id);
    return { message: 'Regla de asignación eliminada correctamente' };
  }
}
