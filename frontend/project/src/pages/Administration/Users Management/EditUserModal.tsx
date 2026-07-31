import { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useRolesList, useDepartmentsList, useTeamsByDepartment } from '../../../services/admin-hooks';
import { useUpdateUser } from '../../../services/admin-hooks';
import { useToast } from '../../../components/ui/Toast';
import { useWorkspaceId } from '../../../hooks/useWorkspaceId';
import { MemberType } from '../../../types';
import type { UserResponse, RoleName, UpdateUserRequest } from '../../../types';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserResponse | null;
}

const MEMBER_TYPE_OPTIONS = [
  { value: MemberType.EMPLOYEE, label: 'Employee' },
  { value: MemberType.INTERN, label: 'Intern' },
  { value: MemberType.COMMERCIAL, label: 'Commercial' },
];

export function EditUserModal({ open, onClose, user }: EditUserModalProps) {
  const { toast } = useToast();
  const wsId = useWorkspaceId();
  const updateUser = useUpdateUser();
  const { data: roles } = useRolesList();
  const { data: departments } = useDepartmentsList();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [memberType, setMemberType] = useState<MemberType>(MemberType.EMPLOYEE);
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');

  const { data: teams } = useTeamsByDepartment(wsId, departmentId || undefined);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setEmail(user.email ?? '');
      setMemberType(user.memberType);
      setRole(user.role ?? '');
      setDepartmentId(user.departmentId ?? '');
      setTeamId(user.teamId ?? '');
    }
  }, [user]);

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

  const handleSave = async () => {
    if (!user) return;
    try {
      const payload: UpdateUserRequest = {};
      if (firstName !== user.firstName) payload.firstName = firstName;
      if (lastName !== user.lastName) payload.lastName = lastName;
      if (email !== user.email) payload.email = email;
      if (memberType !== user.memberType) payload.memberType = memberType;
      if (role !== user.role) payload.role = role as RoleName;

      const newDeptId = departmentId || null;
      if (newDeptId !== (user.departmentId ?? null)) payload.departmentId = newDeptId;

      const newTeamId = teamId || null;
      if (newTeamId !== (user.teamId ?? null)) {
        if (newTeamId) {
          payload.teamId = newTeamId;
        } else {
          payload.removeTeam = true;
        }
      }

      await updateUser.mutateAsync({ id: user.id, data: payload });
      toast({ title: 'User updated successfully', tone: 'success' });
      onClose();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Failed to update user', tone: 'danger' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User"
      size="lg"
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={updateUser.isPending}>Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setTeamId('');
            }}
            options={[{ value: '', label: 'No department' }, ...departmentOptions]}
          />
          <Select
            label="Team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            disabled={!departmentId}
            options={[{ value: '', label: 'Not Assigned' }, ...teamOptions]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Member Type"
            value={memberType}
            onChange={(e) => setMemberType(e.target.value as MemberType)}
            options={MEMBER_TYPE_OPTIONS}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[{ value: '', label: 'Select a role...' }, ...roleOptions]}
          />
        </div>
      </div>
    </Modal>
  );
}
