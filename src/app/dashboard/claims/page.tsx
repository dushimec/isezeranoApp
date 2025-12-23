'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Claim, ClaimStatus, ClaimSeverity } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { t } from "@/utils/i18n";

const getStatusBadgeVariant = (status: ClaimStatus) => {
    switch (status) {
        case 'PENDING': return 'secondary';
        case 'IN_REVIEW': return 'default';
        case 'RESOLVED': return 'outline';
        case 'REJECTED': return 'destructive';
        default: return 'secondary';
    }
}

const getSeverityBadgeVariant = (severity: ClaimSeverity) => {
    switch (severity) {
        case 'LOW': return 'secondary';
        case 'MEDIUM': return 'default';
        case 'HIGH': return 'destructive';
        default: return 'secondary';
    }
}


export default function ClaimsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [updatedStatus, setUpdatedStatus] = useState<ClaimStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchClaims = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/disciplinarian/claims', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch claims.');
      const data = await response.json();
      setClaims(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleViewDetails = async (claimId: string) => {
    try {
      const response = await fetch(`/api/disciplinarian/claims/${claimId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(!response.ok) throw new Error('Failed to fetch claim details.');
      const data = await response.json();
      setSelectedClaim(data);
      setUpdatedStatus(data.status);
      setResolutionNote(data.resolutionNote || '');
      setIsDetailsOpen(true);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }

  const handleUpdateClaim = async () => {
    if (!selectedClaim || !updatedStatus) return;
    setIsUpdating(true);
    try {
        const response = await fetch(`/api/disciplinarian/claims/${selectedClaim.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                status: updatedStatus,
                resolutionNote: resolutionNote
            })
        });

        if (!response.ok) throw new Error('Failed to update claim.');
        
        toast({ title: 'Success', description: 'Claim has been updated.' });
        setIsDetailsOpen(false);
        fetchClaims(); // Refresh the list
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">{t("claimsPage.title")}</h1>
        <p className="text-muted-foreground">
          {t("claimsPage.description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("claimsPage.tableTitle")}</CardTitle>
          <CardDescription>
            {t("claimsPage.tableDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("claimsPage.submittedBy")}</TableHead>
                <TableHead>{t("claimsPage.claimTitle")}</TableHead>
                <TableHead>{t("claimsPage.severity")}</TableHead>
                <TableHead>{t("claimsPage.status")}</TableHead>
                <TableHead>{t("claimsPage.submitted")}</TableHead>
                <TableHead className="text-right">{t("claimsPage.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">{t("claimsPage.loading")}</TableCell></TableRow>
              ) : claims.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">{t("claimsPage.noClaims")}</TableCell></TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Image
                              src={claim.submittedBy?.profileImage || `https://picsum.photos/seed/${claim.submittedById}/40/40`}
                              width={40}
                              height={40}
                              alt={claim.isAnonymous ? t("claimsPage.anonymous") : `${claim.submittedBy?.firstName || ''} ${claim.submittedBy?.lastName || ''}`}
                              className="rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{claim.isAnonymous ? t("claimsPage.anonymous") : `${claim.submittedBy?.firstName || ''} ${claim.submittedBy?.lastName || ''}`}</p>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{claim.title}</TableCell>
                    <TableCell><Badge variant={getSeverityBadgeVariant(claim.severity)}>{t(`myClaimsPage.severity${claim.severity.charAt(0) + claim.severity.slice(1).toLowerCase()}`)}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{t(`claimsPage.details.${claim.status.toLowerCase()}`)}</Badge></TableCell>
                    <TableCell>{formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim.id)}>{t("claimsPage.viewDetails")}</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("claimsPage.detailsTitle")}</DialogTitle>
            <DialogDescription>
              {t("claimsPage.detailsDesc")}
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
              <p><strong>{t("claimsPage.details.title")}:</strong> {selectedClaim.title}</p>
              <p><strong>{t("claimsPage.details.description")}:</strong> {selectedClaim.description}</p>
              <p><strong>{t("claimsPage.details.severity")}:</strong> <Badge variant={getSeverityBadgeVariant(selectedClaim.severity)}>{t(`myClaimsPage.severity${selectedClaim.severity.charAt(0) + selectedClaim.severity.slice(1).toLowerCase()}`)}</Badge></p>
              <p><strong>{t("claimsPage.details.submitted")}:</strong> {format(new Date(selectedClaim.createdAt), 'PPP p')}</p>
              {selectedClaim.attachment && (
                  <p><strong>{t("claimsPage.details.attachment")}:</strong> <Button asChild variant="link"><Link href={selectedClaim.attachment} target="_blank">{t("claimsPage.details.attachment")}</Link></Button></p>
              )}
              <div className="space-y-2">
                <Label htmlFor="status">{t("claimsPage.details.updateStatus")}</Label>
                <Select value={updatedStatus || selectedClaim.status} onValueChange={(value) => setUpdatedStatus(value as ClaimStatus)}>
                    <SelectTrigger>
                        <SelectValue placeholder={t("claimsPage.details.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">{t("claimsPage.details.pending")}</SelectItem>
                        <SelectItem value="IN_REVIEW">{t("claimsPage.details.inReview")}</SelectItem>
                        <SelectItem value="RESOLVED">{t("claimsPage.details.resolved")}</SelectItem>
                        <SelectItem value="REJECTED">{t("claimsPage.details.rejected")}</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="resolutionNote">{t("claimsPage.details.resolutionNote")}</Label>
                  <Textarea id="resolutionNote" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} placeholder={t("claimsPage.details.notePlaceholder")}/>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>{t("claimsPage.cancel")}</Button>
            <Button onClick={handleUpdateClaim} disabled={isUpdating}>{isUpdating ? t("claimsPage.updating") : t("claimsPage.saveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
