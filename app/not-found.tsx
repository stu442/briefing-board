import Link from 'next/link';

import { LinkButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="container py-10">
      <Card className="mx-auto max-w-xl border-border/80 bg-card/95">
        <CardHeader>
          <CardDescription>404</CardDescription>
          <CardTitle>브리핑을 찾지 못했어</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">링크가 바뀌었거나 아직 생성되지 않은 날짜일 수 있어.</p>
          <LinkButton href="/" variant="secondary">목록으로 돌아가기</LinkButton>
          <p className="text-xs text-muted-foreground">
            직접 홈으로 가려면 <Link href="/" className="underline underline-offset-4">메인 페이지</Link>를 눌러.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
