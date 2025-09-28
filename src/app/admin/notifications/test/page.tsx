import { readFileSync } from 'fs';
import { join } from 'path';

export default function TestNotificationsPage() {
  const htmlPath = join(process.cwd(), 'src/app/admin/notifications/test.html');
  const htmlContent = readFileSync(htmlPath, 'utf8');
  
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}








