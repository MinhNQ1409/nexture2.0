'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Trash2, UserPlus } from 'lucide-react';
import { ORG_ROLES, ROLE_LABELS, type OrgRole } from '@nexture/contracts';
import { Alert, Badge, Button, Card, Field, Input, PageHeader, Select, tableHead, tableRow } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Member = { userId: string; name: string; email: string; role: OrgRole; joinedAt: string };
type Invite = { id: string; role: string; email: string | null; expiresAt: string; createdBy: { name: string } };
const fmt = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');
const ROLE_TONE: Record<OrgRole, 'success' | 'info' | 'neutral'> = { ADMIN: 'success', EDITOR: 'info', VIEWER: 'neutral' };

export function MembersView({ orgId, me, canManage, members, invites }: { orgId: string; me: string; canManage: boolean; members: Member[]; invites: Invite[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
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
    // workspace-content
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PageHeader
        title="Thành viên"
        description={canManage ? 'Quản lý ai được vào Culture Hub và họ được làm gì.' : 'Những người đang cùng xây dựng Culture Hub.'}
        action={
          canManage && (
            <Button onClick={() => setInviting(!inviting)}>
              <UserPlus size={20} strokeWidth={1.5} aria-hidden />
              Thêm thành viên
            </Button>
          )
        }
      />
      {error && <Alert>{error}</Alert>}

      {canManage && inviting && (
        <Card>
          <h2 className="text-heading-md">Thêm thành viên</h2>
          <p className="mt-1 text-body-md text-ink-mute">Người được thêm chỉ cần đăng nhập (hoặc đăng ký) bằng đúng email này là vào được doanh nghiệp với vai trò đã chọn.</p>
          <form
            className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)_auto] md:items-start"
            onSubmit={(e) => {
              e.preventDefault();
              return run(async () => {
                const r = await api<{ status: 'ADDED' | 'PENDING'; email: string }>(`/orgs/${orgId}/members`, { method: 'POST', json: { role: inviteRole, email: inviteEmail } });
                setAdded(
                  r.status === 'ADDED'
                    ? `Đã thêm ${r.email}. Người này đã có tài khoản nên vào được ngay.`
                    : `Đã thêm ${r.email}. Khi người này đăng nhập hoặc đăng ký bằng email này, họ sẽ vào doanh nghiệp ngay.`,
                );
                setInviteEmail('');
              });
            }}
          >
            <Field label="Email">
              <Input type="email" required value={inviteEmail} placeholder="ten@congty.vn" onChange={(e) => setInviteEmail(e.target.value)} />
            </Field>
            <Field label="Vai trò">
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}>
                {ORG_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" className="md:mt-[26px]">
              <UserPlus size={20} strokeWidth={1.5} aria-hidden />
              Tạo
            </Button>
          </form>
          {added && (
            <div className="mt-4">
              <Alert tone="success">{added}</Alert>
            </div>
          )}
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas-white shadow-card">
        <table className="w-full min-w-[640px] text-body-md">
          <thead className={tableHead}>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th className="w-px" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId} className={tableRow}>
                <td className="font-semibold">
                  {m.name}
                  {m.userId === me && <span className="ml-2 text-caption font-normal text-ink-mute">(bạn)</span>}
                </td>
                <td className="text-ink-mute">{m.email}</td>
                <td>
                  {canManage ? (
                    <Select
                      aria-label={`Vai trò của ${m.name}`}
                      className="w-40"
                      value={m.role}
                      onChange={(e) => run(() => api(`/orgs/${orgId}/members/${m.userId}`, { method: 'PATCH', json: { role: e.target.value } }))}
                    >
                      {ORG_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge tone={ROLE_TONE[m.role]}>{ROLE_LABELS[m.role]}</Badge>
                  )}
                </td>
                <td className="tabular">{fmt(m.joinedAt)}</td>
                <td className="text-right">
                  {(canManage || m.userId === me) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (!confirm(m.userId === me ? 'Rời khỏi doanh nghiệp này?' : `Xóa ${m.name} khỏi doanh nghiệp?`)) return;
                        run(async () => {
                          await api(`/orgs/${orgId}/members/${m.userId}`, { method: 'DELETE' });
                          if (m.userId === me) window.location.href = '/';
                        });
                      }}
                    >
                      {m.userId === me ? <LogOut size={16} strokeWidth={1.5} aria-hidden /> : <Trash2 size={16} strokeWidth={1.5} aria-hidden />}
                      {m.userId === me ? 'Rời' : 'Xóa'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && (
        <Card>
          <h2 className="text-heading-md">Đang chờ đăng nhập</h2>
          {invites.length === 0 ? (
            <p className="mt-2 text-body-md text-ink-mute">Không có ai đang chờ.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {invites.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-md border border-hairline px-4 py-3">
                  <Badge tone={ROLE_TONE[i.role as OrgRole]}>{ROLE_LABELS[i.role as OrgRole]}</Badge>
                  <span className="min-w-0 flex-1 truncate">{i.email ?? 'Dùng được với mọi email'}</span>
                  <span className="text-caption text-ink-mute">Thêm bởi {i.createdBy.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => run(() => api(`/orgs/${orgId}/invites/${i.id}`, { method: 'DELETE' }))}>
                    Thu hồi
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
