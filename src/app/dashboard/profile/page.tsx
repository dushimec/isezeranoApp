import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { users } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const currentUser = users[0]; // Demoing with the first user

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your photo and personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Image
              src={currentUser.avatar}
              width={100}
              height={100}
              alt="User avatar"
              className="rounded-full"
              data-ai-hint="person portrait"
            />
            <div className="grid gap-2">
              <Label htmlFor="picture">Profile Picture</Label>
              <Input id="picture" type="file" className="w-full max-w-sm" />
              <p className="text-sm text-muted-foreground">
                PNG, JPG, GIF up to 10MB.
              </p>
            </div>
          </div>
          
          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
             <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue={currentUser.phone} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={currentUser.role} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
       <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
    </div>
  );
}
