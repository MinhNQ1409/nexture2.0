'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ORG_ROLES, ROLE_LABELS, type OrgRole } from '@nexture/contracts';
import { Alert, Button, Card, Field, Input, Select } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Member = { userId: string; name: string; email: string; role: OrgRole; joinedAt: string };
type Invite = { id: string; role: string; email: string | null; expiresAt: string; createdBy: { name: string } };
const fmt = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

export function MembersView({ orgId, me, canManage, members, invites }: { orgId: string; me: string; canManage: boolean; members: Member[]; invites: Invite[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<OrgRole>('EDITOR');
  const [inviteEmail, setInviteEmail] = useState('');

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Thành viên</h1>
      {error && <Alert>{error}</Alert>}
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-text-muted">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Tham gia</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId} className="border-t border-border">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">
                  {canManage ? (
                    <Select value={m.role} onChange={(e) => run(() => api(`/orgs/${orgId}/members/${m.userId}`, { method: 'PATCH', json: { role: e.target.value } }))}>
                      {ORG_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    ROLE_LABELS[m.role]
                  )}
                </td>
                <td className="p-3">{fmt(m.joinedAt)}</td>
                <td className="p-3 text-right">
                  {(canManage || m.userId === me) && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!confirm(m.userId === me ? 'Rời khỏi doanh nghiệp này?' : `Xóa ${m.name} khỏi doanh nghiệp?`)) return;
                        run(async () => {
                          await api(`/orgs/${orgId}/members/${m.userId}`, { method: 'DELETE' });
                          if (m.userId === me) window.location.href = '/';
                        });
                      }}
                    >
                      {m.userId === me ? 'Rời' : 'Xóa'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {canManage && (
        <>
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Mời thành viên</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vai trò">
                <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}>
                  {ORG_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Email (tùy chọn)" hint="Chỉ email này dùng được lời mời">
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </Field>
            </div>
            <Button
              onClick={() =>
                run(async () => {
                  const r = await api<{ url: string }>(`/orgs/${orgId}/invites`, { method: 'POST', json: { role: inviteRole, email: inviteEmail || null } });
                  setLink(r.url);
                  setInviteEmail('');
                })
              }
            >
              Tạo link mời
            </Button>
            {link && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input readOnly value={link} />
                  <Button variant="secondary" onClick={() => navigator.clipboard.writeText(link)}>
                    Sao chép
                  </Button>
                </div>
                <p className="text-xs text-warning">Link chỉ hiển thị một lần, hết hạn sau 7 ngày.</p>
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Lời mời đang chờ</h2>
            {invites.length === 0 && <p className="text-sm text-text-muted">Không có lời mời nào.</p>}
            {invites.map((i) => (
              <div key={i.id} className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span>
                  {ROLE_LABELS[i.role as OrgRole]} · {i.email ?? 'mọi email'} · hết hạn {fmt(i.expiresAt)} · tạo bởi {i.createdBy.name}
                </span>
                <Button variant="secondary" onClick={() => run(() => api(`/orgs/${orgId}/invites/${i.id}`, { method: 'DELETE' }))}>
                  Thu hồi
                </Button>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
