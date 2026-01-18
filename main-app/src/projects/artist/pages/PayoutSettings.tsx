import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  CreditCard,
  Banknote,
  Shield,
  CheckCircle,
  AlertTriangle,
  Edit,
  Plus,
  Trash2
} from "lucide-react"

export default function PayoutSettings() {
  const [isEditing, setIsEditing] = useState(false)

  const bankAccounts = [
    {
      id: 1,
      bankName: "State Bank of India",
      accountNumber: "****1234",
      accountType: "Savings",
      ifsc: "SBIN0001234",
      status: "Verified",
      isPrimary: true,
      addedDate: "Jan 15, 2024"
    },
    {
      id: 2,
      bankName: "HDFC Bank",
      accountNumber: "****5678",
      accountType: "Current",
      ifsc: "HDFC0001234",
      status: "Pending Verification",
      isPrimary: false,
      addedDate: "Jan 10, 2024"
    }
  ]

  const payoutSchedule = {
    frequency: "Weekly",
    nextPayout: "Jan 22, 2024",
    minimumAmount: 1000,
    currentBalance: 12300
  }

  const taxSettings = {
    panNumber: "ABCDE1234F",
    gstNumber: "27ABCDE1234F1Z5",
    taxDeduction: "TDS as applicable"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-success text-success-foreground">Verified</Badge>
      case "Pending Verification":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payout Settings</h1>
          <p className="text-muted-foreground">Manage your payment methods and payout preferences</p>
        </div>
      </div>

      <Tabs defaultValue="bank-accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bank-accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="payout-schedule">Payout Schedule</TabsTrigger>
          <TabsTrigger value="tax-info">Tax Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="bank-accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Bank Accounts</h3>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Bank Account
            </Button>
          </div>

          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <Card key={account.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{account.bankName}</h4>
                          {account.isPrimary && (
                            <Badge className="bg-accent text-accent-foreground">Primary</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Account: {account.accountNumber} ({account.accountType})</div>
                          <div>IFSC: {account.ifsc}</div>
                          <div>Added: {account.addedDate}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(account.status)}
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!account.isPrimary && (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {account.status === "Verified" && (
                    <div className="mt-4 p-3 bg-success/10 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">Account verified and ready for payouts</span>
                    </div>
                  )}
                  
                  {account.status === "Pending Verification" && (
                    <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-warning">Verification in progress</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        We'll send a small amount to verify this account. This usually takes 1-2 business days.
                      </div>
                    </div>
                  )}
                  
                  {!account.isPrimary && account.status === "Verified" && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Set as Primary
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payout-schedule" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5" />
                Payout Schedule Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Payout Frequency
                    </label>
                    <select className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                      <option value="weekly">Weekly (Recommended)</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Minimum Payout Amount (₹)
                    </label>
                    <Input 
                      type="number" 
                      value={payoutSchedule.minimumAmount}
                      className="border-border"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Payouts will only be processed when your balance reaches this amount
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Card className="border-border bg-muted/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-3">Current Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Balance:</span>
                          <span className="font-medium text-foreground">₹{payoutSchedule.currentBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next Payout:</span>
                          <span className="font-medium text-foreground">{payoutSchedule.nextPayout}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="font-medium text-foreground">{payoutSchedule.frequency}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Payouts are processed automatically based on your schedule. 
                      You can also request manual payouts for urgent needs.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="outline">Request Manual Payout</Button>
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-info" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      PAN Number
                    </label>
                    <Input 
                      value={taxSettings.panNumber}
                      placeholder="ABCDE1234F"
                      className="border-border"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      GST Number (Optional)
                    </label>
                    <Input 
                      value={taxSettings.gstNumber}
                      placeholder="27ABCDE1234F1Z5"
                      className="border-border"
                      disabled={!isEditing}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Required if your annual turnover exceeds ₹20 lakhs
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Card className="border-border bg-muted/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-3">Tax Compliance</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-foreground">PAN verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-foreground">GST registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span className="text-sm text-foreground">TDS applicable on earnings</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      <strong>Important:</strong> Tax documents (Form 16A, TDS certificates) 
                      will be available in your dashboard during tax filing season.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit Information'}
                </Button>
                {isEditing && (
                  <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                    Save Changes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your payouts
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for all payout activities
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">SMS Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Get SMS notifications for successful payouts
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Payout Limits</h4>
                    <p className="text-sm text-muted-foreground">
                      Daily limit: ₹50,000 | Monthly limit: ₹5,00,000
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Modify</Button>
                </div>
              </div>
              
              <div className="p-4 bg-destructive/10 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Security Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Never share your login credentials or OTP with anyone. Our team will never ask 
                  for your password or banking details over phone or email.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}