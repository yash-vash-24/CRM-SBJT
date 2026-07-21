// Trigger fresh build for Shree Balaji Traders branding
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  ArrowRight, 
  Award, 
  Briefcase, 
  Building2, 
  Cable, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Compass, 
  Database, 
  DollarSign, 
  FileText, 
  HardHat, 
  Info, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  UserCheck, 
  Users, 
  Zap 
import { API_URL } from '@/config/api';

export default function PublicLandingPage() {
  // States for interactive UI
  const [projectTab, setProjectTab] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'transformer',
    budget: '',
    details: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/tenders/public-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteForm)
      });
      if (res.ok) {
        setQuoteSubmitted(true);
        setQuoteForm({ name: '', company: '', email: '', phone: '', service: 'transformer', budget: '', details: '' });
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit quote request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Network error. Unable to connect to the backend server.');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  // Mock projects for the showcase
  const projects = [
    {
      id: 1,
      name: "11KV Line Construction - Hisar Bypass",
      client: "DHBVN",
      location: "Hisar Bypass, Haryana",
      budget: "₹45.0 Lakhs",
      progress: 65,
      status: "ongoing",
      category: "Transmission Line",
      image: "⚡"
    },
    {
      id: 2,
      name: "100 KVA Substation Commissioning",
      client: "Adani Transmission",
      location: "Jind Road Logistics Park, Haryana",
      budget: "₹25.0 Lakhs",
      progress: 100,
      status: "completed",
      category: "Transformer",
      image: "🏥"
    },
    {
      id: 3,
      name: "Jio 5G Cell Poles Erection",
      client: "Reliance Jio",
      location: "Rohtak & Sirsa Cities, Haryana",
      budget: "₹18.0 Lakhs",
      progress: 40,
      status: "ongoing",
      category: "Utility Poles",
      image: "📶"
    },
    {
      id: 4,
      name: "33/11KV Substation Bay Extension",
      client: "DHBVN Sirsa Division",
      location: "Industrial Area, Sirsa, Haryana",
      budget: "₹1.25 Crore",
      progress: 100,
      status: "completed",
      category: "Substation",
      image: "🏭"
    }
  ];

  const filteredProjects = projectTab === 'all' 
    ? projects 
    : projects.filter(p => p.status === projectTab);

  const services = [
    {
      icon: <Building2 className="w-10 h-10 text-blue-400" />,
      title: "Substation Construction",
      description: "Complete design, testing, and erection of 33/11KV substations, control panels, bay extensions, and grounding grid networks."
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-400" />,
      title: "Transformer Installation",
      description: "Commissioning and placement of oil-cooled & dry-type step-down transformers ranging from 63 KVA to 10 MVA with complete DHBVN clearance."
    },
    {
      icon: <Cable className="w-10 h-10 text-emerald-400" />,
      title: "HT & LT Transmission Lines",
      description: "Construction of 11KV & 33KV overhead high-tension (HT) grid circuits, and insulated low-tension (LT) aerial bunched cable lines."
    },
    {
      icon: <HardHat className="w-10 h-10 text-orange-400" />,
      title: "Electricity Pole Erection",
      description: "Utility pole logistics, erection, guy-wire installation, and electrical cross-arm layout. Serving private telecom clients and DISCOMs."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-indigo-400" />,
      title: "Industrial Grid Connections",
      description: "Facilitating end-to-end electrical compliance, load sanctioning, meter installation, and test report filings with state departments."
    },
    {
      icon: <Activity className="w-10 h-10 text-rose-400" />,
      title: "Operation & Maintenance",
      description: "24/7 predictive maintenance, grid breakdown repair, insulator replacement, power line re-conductoring, and cable fault detection."
    }
  ];

  const careers = [
    { title: "Junior Electrical Engineer", department: "Substation Projects", location: "Hisar", type: "Full-Time" },
    { title: "Lineman / ITI Electrician", department: "Distribution & Erection", location: "Sirsa / Rohtak", type: "Contract" },
    { title: "Operations Supervisor", department: "Project Management", location: "Gurugram", type: "Full-Time" }
  ];

  const faqs = [
    { q: "Is the company licensed to carry out Class-A electrical work?", a: "Yes, we hold a government-certified Class-A Electrical Contractor License, which authorizes us to design and build overhead transmission lines, substations, and industrial grid connections of up to 33KV and above across Haryana and surrounding states." },
    { q: "What utility boards do you coordinate with?", a: "We work directly with Dakshin Haryana Bijli Vitran Nigam (DHBVN), Uttar Haryana Bijli Vitran Nigam (UHBVN), and Haryana Vidyut Prasaran Nigam (HVPNL) for load sanctions, lines approvals, meter testing, and final grid synchronization." },
    { q: "How do you track project safety and field progress?", a: "We maintain a rigorous site safety standard. Field supervisors use our customized internal project dashboard (VoltFlow CRM) to record daily worker attendance, track cable re-reeling status, and upload time-stamped images of pole erection." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/85 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">Shree Balaji Traders</span>
              <span className="text-xs block text-slate-400 font-medium -mt-1">Contracting & Supply Ltd</span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-blue-400 transition-colors">About Us</a>
            <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
            <a href="#projects" className="hover:text-blue-400 transition-colors">Projects</a>
            <a href="#careers" className="hover:text-blue-400 transition-colors">Careers</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-lg transition-all"
            >
              Employee Login
            </Link>
            <a 
              href="#quote" 
              className="hidden sm:inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/25 transition-all"
            >
              Request Quote
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.25),rgba(255,255,255,0))]">
        {/* Glow grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.65)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Class-A Licensed Government Contractor</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Powering Utility Grids & <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400">
              Electrical Infrastructure Projects
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            High-voltage contracting, transformer installation, substation erection, and utility maintenance across Haryana and private telecom clusters.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="#quote" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <span>Get Project Quote</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#services" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium rounded-lg transition-all flex items-center justify-center text-base"
            >
              Our Engineering Capabilities
            </a>
          </div>

          {/* Stats widgets */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto border-t border-slate-900 pt-10">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">150+</span>
              <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Projects Completed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-400">100%</span>
              <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">DHBVN Sanction Rate</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">2.5M+</span>
              <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Meters Cable Laid</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-400">₹40Cr+</span>
              <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Tender Portfolio</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Us section */}
      <section id="about" className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Haryana’s Trusted Partner for High-Voltage Electrical Infrastructure
              </h2>
              <p className="mt-6 text-slate-400 font-light leading-relaxed">
                Shree Balaji Traders has been at the forefront of electrical distribution and grid infrastructure. We hold an A-Class electrical contractor license, specialized in delivering power line construction and substation engineering projects for both government institutions and multi-national private infrastructure networks.
              </p>
              <p className="mt-4 text-slate-400 font-light leading-relaxed">
                Our capability stretches from laying high-tension (HT) distribution networks for DHBVN to building rapid deployment utility pole networks for telecom companies like Reliance Jio. We bring engineering precision, speed, and safety to the site.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Licensed Class-A DISCOM Vendor</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Pre-approved Material Procurement</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>100% On-site Safety Standards</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Integrated Real-time CRM Sync</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap className="w-40 h-40 text-blue-500" />
              </div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold block mb-2">Government Credentials</span>
              <h3 className="text-xl font-bold text-white mb-4">DISCOM & Regulatory Approvals</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                  <Award className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white text-sm">DHBVN Empanelled Vendor</h4>
                    <p className="text-xs text-slate-400 mt-1">Officially empanelled with Dakshin Haryana Bijli Vitran Nigam for line drawing, transformer commissioning, and rural/urban electrification works.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                  <Star className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white text-sm">Class-A CEIG License</h4>
                    <p className="text-xs text-slate-400 mt-1">Certified by the Chief Electrical Inspector to Government (CEIG) for high tension (HT) grids execution and commissioning approvals up to 33KV.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">What We Do</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-16">Our Core Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/30 p-8 rounded-2xl text-left transition-all hover:-translate-y-1 duration-300"
              >
                <div className="mb-6">{service.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Track Record</span>
              <h2 className="text-3xl font-bold text-white mt-2">Projects Portfolio</h2>
            </div>

            <div className="flex items-center space-x-2 mt-6 md:mt-0 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
              <button 
                onClick={() => setProjectTab('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${projectTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All Projects
              </button>
              <button 
                onClick={() => setProjectTab('completed')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${projectTab === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setProjectTab('ongoing')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${projectTab === 'ongoing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Ongoing
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((p) => (
              <div 
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col md:flex-row"
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-full md:w-40 flex items-center justify-center p-6 text-5xl">
                  {p.image}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-400 font-semibold uppercase">{p.category}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-snug">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-2">Client: <span className="text-slate-300 font-semibold">{p.client}</span></p>
                    <p className="text-xs text-slate-400 mt-1">Location: <span className="text-slate-300 font-semibold">{p.location}</span></p>
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400">Budget: <strong className="text-white">{p.budget}</strong></span>
                      <span className="text-slate-300 font-bold">{p.progress}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote" className="py-20 bg-slate-900/20 border-t border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText className="w-32 h-32 text-blue-500" />
            </div>

            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Request a Bid</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Submit Quote Request</h2>
              <p className="text-sm text-slate-400 mt-2 font-light">Provide your contracting requirements. Our estimation team will review drawings and return a bill of quantities (BOQ) draft.</p>
            </div>

            {quoteSubmitted ? (
              <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-2xl text-center">
                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Quote Request Received!</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Thank you. An engineering operations coordinator has been assigned to your query and will contact you via email shortly. Reference ID: VT-Q2026</p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Contact Name</label>
                    <input 
                      type="text" 
                      required
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                      placeholder="e.g. Er. Rajesh Yadav"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Company / Department</label>
                    <input 
                      type="text" 
                      required
                      value={quoteForm.company}
                      onChange={(e) => setQuoteForm({...quoteForm, company: e.target.value})}
                      placeholder="e.g. DHBVN Hisar Division"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                      placeholder="email@company.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                      placeholder="+91 99999-99999"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Service Required</label>
                    <select 
                      value={quoteForm.service}
                      onChange={(e) => setQuoteForm({...quoteForm, service: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                    >
                      <option value="transformer">Transformer Installation</option>
                      <option value="line">HT/LT Line Construction</option>
                      <option value="substation">Substation Grid Construction</option>
                      <option value="poles">Electric Pole Erection</option>
                      <option value="maintenance">Utility O&M Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Estimated Budget (INR)</label>
                    <input 
                      type="text" 
                      required
                      value={quoteForm.budget}
                      onChange={(e) => setQuoteForm({...quoteForm, budget: e.target.value})}
                      placeholder="e.g. ₹20 Lakhs"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Scope of Work Details</label>
                  <textarea 
                    rows={4}
                    required
                    value={quoteForm.details}
                    onChange={(e) => setQuoteForm({...quoteForm, details: e.target.value})}
                    placeholder="Provide details such as distance in km for transmission lines, KVA capacity for transformers, site soil type, etc."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Submit Estimate Request</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Join Our Team</span>
            <h2 className="text-3xl font-bold text-white mt-1">Open Site Operations Careers</h2>
            <p className="text-slate-400 mt-2 font-light">Build grid infrastructure that powers cities and villages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careers.map((job, idx) => (
              <div 
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-blue-400 mb-3">
                    <span className="font-semibold uppercase">{job.department}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{job.type}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{job.title}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-4">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>Location: {job.location}</span>
                  </div>
                </div>
                <a 
                  href="#contact"
                  className="mt-6 w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold text-center transition-all block"
                >
                  Send Application Details
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Answers</span>
            <h2 className="text-3xl font-bold text-white mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white text-base hover:bg-slate-850/50"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-all ${activeFaq === idx ? 'rotate-90 text-blue-400' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 pt-1 text-slate-400 text-sm leading-relaxed font-light border-t border-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Locate Us</span>
              <h2 className="text-3xl font-bold text-white mt-1">Get in Touch</h2>
              <p className="text-slate-400 mt-4 font-light leading-relaxed">Have questions about tenders, ongoing projects, or procurement certifications? Reach out directly via our physical offices or email.</p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Corporate Office</h4>
                    <p className="text-xs text-slate-400 mt-1">Plot No. 12, Sector 18, Gurugram, Haryana</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Site Operations Center</h4>
                    <p className="text-xs text-slate-400 mt-1">Vidyut Nagar Road, Near Substation Office, Hisar, Haryana</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Phone Contacts</h4>
                    <p className="text-xs text-slate-400 mt-1">+91 1662 222333 (Hisar)</p>
                    <p className="text-xs text-slate-400 mt-0.5">+91 98765 43210 (Mobile)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Email Address</h4>
                    <p className="text-xs text-slate-400 mt-1">info@shreebalajitraders.com</p>
                    <p className="text-xs text-slate-400 mt-0.5">tenders@shreebalajitraders.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 relative">
              <h3 className="font-bold text-white text-xl mb-6">Send Direct Inquiry</h3>
              {contactSubmitted ? (
                <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-2xl text-center">
                  <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h4 className="font-bold text-white text-base mb-1">Inquiry Sent Successfully!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Thank you. Your message has been logged. We will address it within 24 operational hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        placeholder="Er. Suresh Kumar"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        placeholder="suresh@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      placeholder="e.g. Substation Maintenance Bid Inquiry"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Message Description</label>
                    <textarea 
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="Provide detailed description of your query..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Send Inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">Shree Balaji Traders</span>
              <span className="text-[10px] text-slate-400 block -mt-1">Class-A Electrical Contractor License No: 182-E</span>
            </div>
          </div>

          <div className="flex space-x-6 mb-6 md:mb-0 text-slate-400">
            <a href="#about" className="hover:text-blue-400 transition-colors">About Us</a>
            <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
            <a href="#projects" className="hover:text-blue-400 transition-colors">Projects</a>
            <a href="#careers" className="hover:text-blue-400 transition-colors">Careers</a>
            <Link href="/login" className="hover:text-blue-400 transition-colors">Employee Portal</Link>
          </div>

          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} Shree Balaji Traders Ltd. All rights reserved.</p>
            <p className="mt-1 text-[10px] text-slate-600">Designed for Utility-Grade Electrical Infrastructure Contracting & Project Auditing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
