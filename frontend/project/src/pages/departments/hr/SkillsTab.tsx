import { useState } from 'react';
import { Search, Plus, Check, X, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useEmployeesList } from '../../../services/employee-hooks';
import { useEmployeeSkillsList, useCreateEmployeeSkill, useDeleteEmployeeSkill, useVerifyEmployeeSkill } from '../../../services/employee-skill-hooks';
import type { CreateEmployeeSkillRequest } from '../../../services/employee-skill-service';

const levelColors: Record<string, string> = {
  BEGINNER: 'info',
  INTERMEDIATE: 'warning',
  ADVANCED: 'success',
  EXPERT: 'accent',
};

export function SkillsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [skillForm, setSkillForm] = useState<CreateEmployeeSkillRequest>({
    skillName: '', category: 'TECHNICAL', proficiencyLevel: 'INTERMEDIATE',
  });

  const { data: empData } = useEmployeesList(wsId, deptId);
  const { data: skillData } = useEmployeeSkillsList(wsId, deptId, selectedEmp ?? '');
  const createSkill = useCreateEmployeeSkill(wsId, deptId, selectedEmp ?? '');
  const deleteSkill = useDeleteEmployeeSkill(wsId, deptId, selectedEmp ?? '');
  const verifySkill = useVerifyEmployeeSkill(wsId, deptId, selectedEmp ?? '');

  const employees = empData?.content ?? [];
  const skills = skillData?.content ?? [];

  const filteredSkills = skills.filter((s) => {
    if (!search) return true;
    return s.skillName.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddSkill = () => {
    if (!selectedEmp) return;
    createSkill.mutate(skillForm, {
      onSuccess: () => { setShowForm(false); setSkillForm({ skillName: '', category: 'TECHNICAL', proficiencyLevel: 'INTERMEDIATE' }); },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <select value={selectedEmp ?? ''} onChange={(e) => { setSelectedEmp(e.target.value || null); setShowForm(false); }}
          className="cx-input h-10 px-3 max-w-xs">
          <option value="">Select an employee...</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </select>
        {selectedEmp && (
          <Button leftIcon={<Plus />} size="sm" onClick={() => setShowForm(true)}>Add Skill</Button>
        )}
      </div>

      {!selectedEmp && (
        <EmptyState icon={<Search />} title="Select an employee" description="Choose an employee to view and manage their skills." />
      )}

      {showForm && selectedEmp && (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-body font-semibold text-text-primary">Add Skill</h3>
              <IconButton label="Close" variant="ghost" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></IconButton>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input placeholder="Skill Name" value={skillForm.skillName} onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })} />
              </div>
              <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                className="cx-input h-10 px-3">
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT_SKILL">Soft Skill</option>
                <option value="MANAGEMENT">Management</option>
                <option value="CERTIFICATION">Certification</option>
              </select>
              <select value={skillForm.proficiencyLevel} onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
                className="cx-input h-10 px-3">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleAddSkill} disabled={!skillForm.skillName}>Add</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {selectedEmp && !showForm && (
        <>
          <Input placeholder="Search skills..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-sm" />
          {filteredSkills.length === 0 ? (
            <EmptyState icon={<Search />} title="No skills found" description="Add skills to track employee capabilities." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSkills.map((s) => (
                <Card key={s.id}>
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body font-medium text-text-primary">{s.skillName}</p>
                        <p className="text-2xs text-text-tertiary">{s.category.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {s.verified && <Check className="h-4 w-4 text-success-500" />}
                        <IconButton label="Delete" variant="ghost" size="sm" className="text-danger-600" onClick={() => deleteSkill.mutate(s.id)}>
                          <X className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={(levelColors[s.proficiencyLevel] ?? 'neutral') as any} variant="soft">{s.proficiencyLevel}</Badge>
                      {s.yearsOfExperience && <span className="text-2xs text-text-tertiary">{s.yearsOfExperience}y exp</span>}
                    </div>
                    {!s.verified && (
                      <Button variant="outline" size="sm" onClick={() => verifySkill.mutate(s.id)}>Verify</Button>
                    )}
                    {s.certificationName && (
                      <div className="border-t border-border-subtle pt-2 mt-1">
                        <p className="text-2xs text-text-tertiary">Cert: {s.certificationName}</p>
                        {s.certificationIssuer && <p className="text-2xs text-text-tertiary">Issuer: {s.certificationIssuer}</p>}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
