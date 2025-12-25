import { Suspense } from 'react';
import UnsubscribeForm from './unsubscribe-form';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-12 pb-12">
              <div className="flex justify-center mb-6">
                <Spinner size="lg" className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground">
                Please wait while we load the unsubscribe page
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <UnsubscribeForm />
    </Suspense>
  );
}
