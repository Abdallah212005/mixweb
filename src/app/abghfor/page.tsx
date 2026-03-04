
"use client";

import React, { useState, useEffect } from "react";
import { useCollection, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Calendar, Trash2, CheckCircle, Search, LogIn, ShieldAlert, Key, Loader2, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { firestore, user, auth } = useFirebase();
  const { toast } = useToast();
  
  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isElevating, setIsElevating] = useState(false);

  // 1. Monitor user's admin role document
  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "roles_admin", user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);
  
  // Authorization check
  const isAuthorized = !!adminRole && adminRole.role === "admin";

  // 2. Query submissions only if authorized
  const submissionsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isAuthorized) return null;
    return query(collection(firestore, "contactSubmissions"), orderBy("submissionDateTime", "desc"));
  }, [firestore, user, isAuthorized]);

  const { data: submissions, isLoading: isDataLoading } = useCollection(submissionsQuery);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing Credentials", description: "Please enter your agent ID and key." });
      return;
    }
    initiateEmailSignIn(auth, email, password);
    toast({ title: "Verifying Identity", description: "Connecting to secure servers..." });
  };

  const handleBecomeAdmin = () => {
    if (!user || !firestore) return;
    setIsElevating(true);
    setDocumentNonBlocking(
      doc(firestore, "roles_admin", user.uid),
      { id: user.uid, role: "admin", grantedAt: new Date().toISOString() },
      { merge: true }
    );
    setTimeout(() => setIsElevating(false), 1500);
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "contactSubmissions", id));
    toast({ title: "Transmission Purged" });
  };

  const markAsRead = (id: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, "contactSubmissions", id), { status: "read" });
  };

  const filteredSubmissions = submissions?.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isAdminCheckLoading || isElevating;

  return (
    <div className="min-h-screen bg-[#050406] text-white p-6 md:p-12 font-body selection:bg-accent selection:text-black">
      {/* HUD Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-screen bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {!user ? (
          // LOGIN WINDOW
          <div className="min-h-[80vh] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_0_50px_rgba(168,85,247,0.1)]"
            >
              <div className="flex flex-col items-center mb-10">
                <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Shield className="text-accent w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-widest text-gradient mb-2">Mix Aura</h2>
                <p className="text-white/30 font-code text-[10px] tracking-[0.4em] uppercase">Intelligence Access</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-code text-white/40 uppercase tracking-widest ml-2">Agent ID</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mixaura10@gmail.com" 
                      className="bg-black/40 border-white/10 pl-12 h-14 rounded-2xl focus:border-accent/50 transition-all font-code text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-code text-white/40 uppercase tracking-widest ml-2">Access Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="bg-black/40 border-white/10 pl-12 h-14 rounded-2xl focus:border-accent/50 transition-all font-code text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/80 text-black font-black uppercase tracking-[0.3em] h-14 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all mt-4">
                  Initialize Sync
                </Button>
              </form>
            </motion.div>
          </div>
        ) : !isAuthorized && !isLoading ? (
          // UNAUTHORIZED STATE (BUT LOGGED IN)
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
             <ShieldAlert className="w-24 h-24 text-destructive mb-8 drop-shadow-[0_0_20px_#ef4444]" />
             <h2 className="text-4xl font-black mb-4 uppercase tracking-widest text-destructive">Restricted Area</h2>
             <p className="text-white/40 font-code max-w-md mb-12 leading-relaxed text-sm">
                Identity confirmed, but security clearance for /roles_admin is missing.
             </p>
             <Button onClick={handleBecomeAdmin} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 font-black uppercase tracking-[0.3em] px-14 py-8 text-sm rounded-2xl">
                Elevate to Master Admin
             </Button>
          </div>
        ) : isLoading || isDataLoading ? (
          // LOADING STATE
          <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
             <Loader2 className="w-16 h-16 text-accent animate-spin drop-shadow-[0_0_15px_#a855f7]" />
             <p className="font-code text-white/30 tracking-[1em] text-[10px] animate-pulse uppercase">Syncing Database...</p>
          </div>
        ) : (
          // ACTUAL DASHBOARD
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl border border-accent/30">
                    <Shield className="text-accent w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Intelligence Hub</h1>
                    <p className="text-white/30 font-code text-[10px] tracking-[0.5em] uppercase mt-1">Status: Master_Level</p>
                  </div>
                </div>
              </motion.div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                  <Input 
                    placeholder="SEARCH TRANSMISSIONS..." 
                    className="bg-white/5 border-white/10 pl-10 h-12 w-full md:w-80 font-code text-[10px] rounded-xl focus:border-accent/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => auth.signOut()} variant="outline" className="border-white/10 text-white/40 hover:text-white hover:bg-white/5 font-code text-[10px] h-12 px-6 rounded-xl">
                  TERMINATE_SESSION
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
              <AnimatePresence>
                {filteredSubmissions?.length === 0 ? (
                  <div className="text-center py-40 text-white/20 font-code uppercase tracking-[1em] border border-dashed border-white/10 rounded-[2.5rem]">
                    No Signals Found.
                  </div>
                ) : (
                  filteredSubmissions?.map((sub, index) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-white/5 border-white/10 hover:border-accent/40 transition-all duration-500 overflow-hidden rounded-[2rem] backdrop-blur-3xl group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                               <Mail className="text-accent w-6 h-6" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-black uppercase text-white tracking-tight">{sub.name}</CardTitle>
                              <div className="flex items-center gap-4 text-white/40 text-[10px] font-code mt-2">
                                <span className="bg-white/5 px-3 py-1 rounded-full">{sub.email}</span>
                                <span className="bg-white/5 px-3 py-1 rounded-full">{new Date(sub.submissionDateTime).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {sub.status === 'new' && (
                              <Badge className="bg-accent text-black font-black text-[9px] px-4 py-2 animate-pulse rounded-lg">NEW_SIGNAL</Badge>
                            )}
                            <Button 
                              onClick={() => markAsRead(sub.id)}
                              variant="ghost" 
                              size="icon" 
                              className="w-12 h-12 rounded-xl text-white/20 hover:text-accent hover:bg-accent/10"
                              disabled={sub.status === 'read'}
                            >
                              <CheckCircle size={20} />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(sub.id)}
                              variant="ghost" 
                              size="icon" 
                              className="w-12 h-12 rounded-xl text-white/20 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={20} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                            <p className="text-white/70 text-sm italic">"{sub.message}"</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
