'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Copy, Link2, LogOut, Trash2, UserPlus } from 'lucide-react';
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
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
              Mời thành viên
            </Button>
          )
        }
      />
      {error && <Alert>{error}</Alert>}

      {canManage && inviting && (
        <Card>
          <h2 className="text-heading-md">Tạo link mời</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] md:items-start">
            <Field label="Vai trò">
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}>
                {ORG_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Email (không bắt buộc)" hint="Chỉ email này dùng được lời mời">
              <Input type="email" value={inviteEmail} placeholder="ten@congty.vn" onChange={(e) => setInviteEmail(e.target.value)} />
            </Field>
            <Button
              className="md:mt-[26px]"
              onClick={() =>
                run(async () => {
                  const r = await api<{ url: string }>(`/orgs/${orgId}/invites`, { method: 'POST', json: { role: inviteRole, email: inviteEmail || null } });
                  setLink(r.url);
                  setCopied(false);
                  setInviteEmail('');
                })
              }
            >
              <Link2 size={20} strokeWidth={1.5} aria-hidden />
              Tạo link
            </Button>
          </div>
          {link && (
            <Card section className="mt-4">
              <div className="flex gap-2">
                <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                  }}
                >
                  <Copy size={20} strokeWidth={1.5} aria-hidden />
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </Button>
              </div>
              <p className="mt-2 text-caption text-warning">Link chỉ hiển thị một lần và hết hạn sau 7 ngày.</p>
            </Card>
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
          <h2 className="text-heading-md">Lời mời đang chờ</h2>
          {invites.length === 0 ? (
            <p className="mt-2 text-body-md text-ink-mute">Chưa có lời mời nào đang chờ.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {invites.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-md border border-hairline px-4 py-3">
                  <Badge tone={ROLE_TONE[i.role as OrgRole]}>{ROLE_LABELS[i.role as OrgRole]}</Badge>
                  <span className="min-w-0 flex-1 truncate">{i.email ?? 'Dùng được với mọi email'}</span>
                  <span className="tabular text-caption text-ink-mute">
                    Hết hạn {fmt(i.expiresAt)} · {i.createdBy.name}
                  </span>
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
