
"use client";

import React, { useState, useEffect } from "react";
import { useCollection, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Calendar, Trash2, CheckCircle, Search, LogIn, ShieldAlert, Key, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { firestore, user, auth } = useFirebase();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Monitor user's admin role document
  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "roles_admin", user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminCheckLoading, error: adminCheckError } = useDoc(adminDocRef);
  
  // We only consider authorized if we have explicit data from the server
  const isAuthorized = !!adminRole && adminRole.role === "admin";

  // 2. Only query submissions if the user is DEFINITIVELY authorized
  // This prevents the "Missing or insufficient permissions" crash on mount
  const submissionsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isAuthorized) return null;
    return query(collection(firestore, "contactSubmissions"), orderBy("submissionDateTime", "desc"));
  }, [firestore, user, isAuthorized]);

  const { data: submissions, isLoading: isDataLoading, error: submissionsError } = useCollection(submissionsQuery);

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "contactSubmissions", id));
    toast({ title: "Transmission Purged", description: "The record has been permanently removed." });
  };

  const markAsRead = (id: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, "contactSubmissions", id), { status: "read" });
    toast({ title: "Status Updated", description: "Transmission marked as analyzed." });
  };

  const handleLogin = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleBecomeAdmin = () => {
    if (!user || !firestore) return;
    
    // Explicitly set the admin role
    setDocumentNonBlocking(
      doc(firestore, "roles_admin", user.uid),
      { 
        id: user.uid, 
        role: "admin", 
        grantedAt: new Date().toISOString(),
        agentName: `AGENT_${user.uid.substring(0, 4).toUpperCase()}`
      },
      { merge: true }
    );
    
    toast({ 
      title: "Elevating Privileges", 
      description: "Synchronizing agent credentials with master database...",
    });

    // Give Firestore a moment to propagate the write before we stop showing the "Access Denied" screen
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const filteredSubmissions = submissions?.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isAdminCheckLoading || isRefreshing;

  return (
    <div className="min-h-screen bg-[#050406] text-white p-6 md:p-12 font-body selection:bg-accent selection:text-black">
      {/* HUD Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-screen bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-accent/10 rounded-xl border border-accent/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Shield className="text-accent w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                  Mix <span className="text-accent">Aura</span>
                </h1>
                <p className="text-white/30 font-code text-[10px] tracking-[0.5em] uppercase mt-1">Intelligence Division</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <Input 
                placeholder="SEARCH TRANSMISSIONS..." 
                className="bg-white/5 border-white/10 pl-10 h-12 w-full md:w-80 font-code text-[10px] rounded-xl focus:border-accent/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {!user ? (
              <Button onClick={handleLogin} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 font-code text-[10px] h-12 px-6 rounded-xl">
                <LogIn size={14} className="mr-2" /> INITIALIZE
              </Button>
            ) : (
               <Badge variant="outline" className="border-accent/50 text-accent font-code py-2 px-4 h-12 flex items-center bg-accent/5 rounded-xl">
                  {isAuthorized ? `MASTER_ACCESS: ${user.uid.substring(0,6).toUpperCase()}` : "GUEST_UNIT"}
               </Badge>
            )}
          </div>
        </header>

        {!user ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
             <Key className="w-20 h-20 text-accent mb-6 animate-pulse" />
             <h2 className="text-3xl font-black mb-3 uppercase tracking-widest text-gradient">Identity Required</h2>
             <p className="text-white/40 font-code text-center max-w-sm mb-10 leading-relaxed">
                The encryption layer requires a valid agent ID to proceed.
             </p>
             <Button onClick={handleLogin} className="bg-accent text-black font-black uppercase tracking-[0.3em] px-12 py-7 rounded-2xl shadow-[0_0_30px_#a855f7]">
                Connect to Command Tunnel
             </Button>
          </motion.div>
        ) : !isAuthorized && !isLoading ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
             <ShieldAlert className="w-24 h-24 text-destructive mb-8 drop-shadow-[0_0_20px_#ef4444]" />
             <h2 className="text-4xl font-black mb-4 uppercase tracking-widest text-destructive">Unauthorized</h2>
             <p className="text-white/40 font-code text-center max-w-sm mb-12 leading-relaxed">
                Your ID is recognized, but doesn't exist in the /roles_admin master records.
             </p>
             <Button onClick={handleBecomeAdmin} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 font-black uppercase tracking-[0.3em] px-14 py-8 text-sm rounded-2xl transition-all hover:scale-105 active:scale-95">
                Elevate to Command Master
             </Button>
          </motion.div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
             <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_30px_#a855f7]" />
             <p className="font-code text-white/30 tracking-[1em] text-[10px] animate-pulse uppercase">Syncing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {filteredSubmissions?.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-40 text-white/20 font-code uppercase tracking-[1em] border border-dashed border-white/10 rounded-[2.5rem]"
                >
                  No Intercepted Transmissions.
                </motion.div>
              ) : (
                filteredSubmissions?.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-accent/40 transition-all duration-500 group overflow-hidden rounded-[2rem] backdrop-blur-3xl">
                      <div className="absolute top-0 left-0 w-2 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all group-hover:bg-accent/20 group-hover:rotate-6">
                             <Mail className="text-accent w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-black uppercase text-white tracking-tight mb-2">
                              {sub.name}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-4 text-white/40 text-[10px] font-code">
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full"><Mail size={12} /> {sub.email}</span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full"><Calendar size={12} /> {new Date(sub.submissionDateTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.status === 'new' && (
                            <Badge className="bg-accent text-black font-black text-[9px] px-4 py-2 animate-pulse rounded-lg">NEW SIGNAL</Badge>
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
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 group-hover:border-accent/10 transition-colors">
                          <p className="text-white/70 text-sm leading-relaxed font-body italic">
                            "{sub.message}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        <footer className="mt-32 pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-code text-white/30 uppercase tracking-[0.5em]">
           <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> ENCRYPTED TUNNEL</span>
             <span className="hidden md:block">|</span>
             <span>TERMINAL_VER_4.2.0</span>
           </div>
           <span>&copy; MIX AURA 2024 - COMMAND CENTER ACCESS</span>
           <div className="flex gap-10">
              <span className="hover:text-accent transition-colors cursor-pointer">Protocol Logs</span>
              <span className="hover:text-accent transition-colors cursor-pointer">Security Specs</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
