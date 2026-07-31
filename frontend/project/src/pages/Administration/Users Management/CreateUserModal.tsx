import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useCreateUser, useRolesList, useDepartmentsList, useTeamsByDepartment } from '../../../services/admin-hooks';
import { useToast } from '../../../components/ui/Toast';
import { useWorkspaceId } from '../../../hooks/useWorkspaceId';
import { MemberType } from '../../../types';
import type { RoleName, NormalizedApiError } from '../../../types';

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email format').max(150),
  memberType: z.nativeEnum(MemberType, { required_error: 'Member type is required' }),
  role: z.string().min(1, 'A role is required'),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

const MEMBER_TYPE_OPTIONS = [
  { value: MemberType.EMPLOYEE, label: 'Employee' },
  { value: MemberType.INTERN, label: 'Intern' },
  { value: MemberType.COMMERCIAL, label: 'Commercial' },
];

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const { toast } = useToast();
  const wsId = useWorkspaceId();
  const createUser = useCreateUser();
  const { data: roles } = useRolesList();
  const { data: departments } = useDepartmentsList();
  const departmentIdValue = useForm<CreateUserFormData>().watch('departmentId');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      memberType: MemberType.EMPLOYEE,
      role: '',
      departmentId: '',
      teamId: '',
    },
  });

  const selectedDeptId = watch('departmentId');
  const { data: teams } = useTeamsByDepartment(wsId, selectedDeptId || undefined);

  useEffect(() => {
    if (open) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        memberType: MemberType.EMPLOYEE,
        role: '',
        departmentId: '',
        teamId: '',
      });
    }
  }, [open, reset]);

  const roleOptions = (roles ?? [])
    .filter((r) => r.name !== 'SUPER_ADMIN')
    .map((r) => ({
      value: r.name,
      label: r.name.charAt(0) + r.name.slice(1).toLowerCase(),
    }));

  const departmentOptions = (departments ?? [])
    .filter((d) => d.status === 'ACTIVE' || !d.status)
    .map((d) => ({
      value: d.id,
      label: d.name,
    }));

  const teamOptions = (teams ?? [])
    .filter((t) => t.status === 'ACTIVE')
    .map((t) => ({
      value: t.id,
      label: t.name,
    }));

  const roleValue = watch('role');

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        memberType: data.memberType,
        role: data.role as RoleName,
        departmentId: data.departmentId || undefined,
        teamId: data.teamId || undefined,
      });
      toast({ title: 'User created successfully', description: 'An activation email has been sent.', tone: 'success' });
      reset();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as NormalizedApiError;
      if (apiErr?.fieldErrors?.length) {
        for (const fe of apiErr.fieldErrors) {
          const field = fe.field as keyof CreateUserFormData;
          if (field in createUserSchema.shape) {
            setError(field, { message: fe.message });
          }
        }
      }
      toast({ title: apiErr?.message ?? 'Failed to create user', tone: 'danger' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSaving = isSubmitting || createUser.isPending;

  return (
    <Modal open={open} onClose={handleClose} title="Invite User" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <p className="text-body text-text-secondary">
          Create a new user account. An activation email will be sent to the provided address.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            disabled={isSaving}
            {...register('firstName')}
            errorText={errors.firstName?.message}
            invalid={!!errors.firstName}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            disabled={isSaving}
            {...register('lastName')}
            errorText={errors.lastName?.message}
            invalid={!!errors.lastName}
          />
        </div>

        <Input
          label="Email Address"
          placeholder="john.doe@company.com"
          type="email"
          disabled={isSaving}
          {...register('email')}
          errorText={errors.email?.message}
          invalid={!!errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Department"
            disabled={isSaving}
            value={watch('departmentId')}
            onChange={(e) => {
              setValue('departmentId', e.target.value, { shouldValidate: true });
              setValue('teamId', '');
            }}
            errorText={errors.departmentId?.message}
            invalid={!!errors.departmentId}
            options={[{ value: '', label: 'No department' }, ...departmentOptions]}
          />
          <Select
            label="Team"
            disabled={isSaving || !selectedDeptId}
            value={watch('teamId')}
            onChange={(e) => setValue('teamId', e.target.value, { shouldValidate: true })}
            options={[{ value: '', label: 'Not Assigned' }, ...teamOptions]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Member Type"
            disabled={isSaving}
            value={watch('memberType')}
            onChange={(e) => setValue('memberType', e.target.value as MemberType, { shouldValidate: true })}
            errorText={errors.memberType?.message}
            invalid={!!errors.memberType}
            options={MEMBER_TYPE_OPTIONS}
          />
          <Select
            label="Role"
            disabled={isSaving}
            value={roleValue}
            onChange={(e) => setValue('role', e.target.value, { shouldValidate: true })}
            errorText={errors.role?.message}
            invalid={!!errors.role}
            options={[{ value: '', label: 'Select a role...' }, ...roleOptions]}
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border-subtle">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
