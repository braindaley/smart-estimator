'use client';

import { Header } from '@/components/header';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface CreditorData {
  creditor: string;
  methodOfCollection: string;
  settlementRange: string;
  negotiationBasis: string;
  settlementMethod: string;
  lawFirmSettlement: string;
  consumerGuidance: string;
  lastUpdated: string;
}

const creditorData: CreditorData[] = [
  { creditor: "Altura Credit Union", methodOfCollection: "Collection Law Firm", settlementRange: "45%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Amazon", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Amercian Eagle - GE Capital", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "American Express", methodOfCollection: "Original Creditor", settlementRange: "52%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "American Express - In-house Legal", methodOfCollection: "Collection Law Firm", settlementRange: "65%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Andreu Palma Andreu", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Apothaker", methodOfCollection: "Collection Law Firm", settlementRange: "79%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Applied Bank - Visa/Mastercard", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Aqua Finance", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "65%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "AR Resource", methodOfCollection: "Original Creditor", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Arvest Bank", methodOfCollection: "Original Creditor", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Associated Credit Union of Texas", methodOfCollection: "Collection Law Firm", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Avant", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Access Financial", methodOfCollection: "Original Creditor", settlementRange: "55%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Bank of America", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "55%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Bank of Missouri", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "45%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Bankers Health Care Group", methodOfCollection: "Collection Law Firm", settlementRange: "45%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Barclays", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "45%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Baxter Employee Credit Union", methodOfCollection: "Original Creditor", settlementRange: "60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "BBT", methodOfCollection: "Original Creditor", settlementRange: "40%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "BBVA Compa", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "40%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Belk", methodOfCollection: "Original Creditor", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Best Buy", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "40%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Best Buy - Maryland", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Best Buy Reward Zone", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Best Egg", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Blitt & Gaines", methodOfCollection: "Collection Law Firm", settlementRange: "75%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Bryant State Bank", methodOfCollection: "Original Creditor", settlementRange: "40%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Cabelas", methodOfCollection: "Original Creditor", settlementRange: "45%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Capital One", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Care Credit", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Care Credit - GE Capital", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Caste Credit Corporation", methodOfCollection: "Original Creditor", settlementRange: "50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Comenity Bank/Kay Jewelers", methodOfCollection: "Collection Law Firm", settlementRange: "75%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "City National Bank", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "40%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "CCB Credit Services", methodOfCollection: "Collection Agency", settlementRange: "40%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "CCB/Home Shopping Network", methodOfCollection: "Collection Agency", settlementRange: "40%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Celtic Bank North", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Chase Bank", methodOfCollection: "Original Creditor", settlementRange: "50%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Chase Legal Department", methodOfCollection: "Collection Law Firm", settlementRange: "75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Circleback Lending", methodOfCollection: "Collection Law Firm", settlementRange: "65%-70%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Citibank", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "40%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Citizens Bank", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "45%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Comenity Bank", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "45%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Collection at Law (Well Fargo)", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Compass Bank - Alabama", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "60%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Continenal Finance Company", methodOfCollection: "Original Creditor", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - American Express", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - Bank of America", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - Citibank", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - Discover", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - FNB Omaha", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - Macy's", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Couch Lambert - Sears", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Country Door", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Credit Consulting Service", methodOfCollection: "Original Creditor", settlementRange: "75%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit Control", methodOfCollection: "Collection Agency", settlementRange: "47%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit Control", methodOfCollection: "Collection Agency", settlementRange: "50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit Control - Citibank", methodOfCollection: "Collection Agency", settlementRange: "40%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit Control - Citibank", methodOfCollection: "Collection Agency", settlementRange: "40%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit First - Ohio", methodOfCollection: "Original Creditor", settlementRange: "40%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit One Bank", methodOfCollection: "Original Creditor", settlementRange: "45-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Credit One Bank - Nevada", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "50%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Cross River Bank", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "40%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Debski & Assoc", methodOfCollection: "Collection Law Firm", settlementRange: "75%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Degrasse Law", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Department Stores National Bank", methodOfCollection: "Collection Agency", settlementRange: "40%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Dillards/Wells Fargo -  TX", methodOfCollection: "Original Creditor", settlementRange: "40%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Discover", methodOfCollection: "Collection Law Firm", settlementRange: "50%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "DSNB - Macy's", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "40%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Elan Financial Services", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "40%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Encore/Citi-Sears", methodOfCollection: "Collection Law Firm", settlementRange: "75-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Sprint/T-Mobile", methodOfCollection: "Collection Agency", settlementRange: "55%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Exxon Mobil", methodOfCollection: "Collection Law Firm", settlementRange: "75%-85%", negotiationBasis: "Current Balance", settlementMethod: "1 lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Farmers Bank & Capital Trust Co", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "1 lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Fifth Third Bank", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "45%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Fingerhut", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "1 lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "First Bank and Trust", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "55%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "First National Bank of Omaha", methodOfCollection: "Original Creditor/Collection Law Firm", settlementRange: "47%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "First National Credit Card", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "1 lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "First Savings Credit Card", methodOfCollection: "Original Creditor", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "1 lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Firstbank", methodOfCollection: "Original Creditor", settlementRange: "55%-60%", negotiationBasis: "Current Balance", settlementMethod: "1 lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Fortiva", methodOfCollection: "Original Creditor", settlementRange: "60%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Foster & Garbus", methodOfCollection: "Collection Law Firm", settlementRange: "60%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Freedom Plus", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Gap", methodOfCollection: "Collection Agency", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Genesis Card Services", methodOfCollection: "Collection Law Firm", settlementRange: "65%-75%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Glasser & Glasser", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Golden One Credit Union", methodOfCollection: "Collection Law Firm", settlementRange: "100%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Goldman Sachs", methodOfCollection: "Collection Law Firm", settlementRange: "50%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Greensky Credit", methodOfCollection: "Original Creditor", settlementRange: "45%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Gurstel Chargo", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Harris & Zide", methodOfCollection: "Collection Law Firm", settlementRange: "60%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Hayt & Hayt", methodOfCollection: "Collection Law Firm", settlementRange: "70%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Helzberg", methodOfCollection: "Collection Agency", settlementRange: "55%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Home Depot", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Home Depot - Nevada", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Home Depot - Ohio", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Home Depot - Texas", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Hood & Stacy", methodOfCollection: "Collection Law Firm", settlementRange: "75%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Howard Lee Schiff", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "HSBC Bank", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Hunt & Henriquez", methodOfCollection: "Collection Law Firm", settlementRange: "80%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Huntington National Bank", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Jared Card Processing Center", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Javitch Block", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "JC Penney", methodOfCollection: "Collection Law Firm", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "JC Penney  -  Debt Management Plan", methodOfCollection: "Collection Law Firm", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Jefferson Capital Systems", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Kohl's", methodOfCollection: "Collection Agency", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Kream", methodOfCollection: "Collection Law Firm", settlementRange: "74%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lending Club", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lendingpoint", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "45%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lendup", methodOfCollection: "Collection Agency", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Levy & Assoc", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lippman Recupero", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lloyd & McDaniel", methodOfCollection: "Collection Law Firm", settlementRange: "65%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Loan Me", methodOfCollection: "Collection Agency", settlementRange: "55%-65%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Loan Depot", methodOfCollection: "Collection Law Firm", settlementRange: "60%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Love Beal & Nixon", methodOfCollection: "Collection Law Firm", settlementRange: "65%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lowes", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Lyons Doughty", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Machol & Johannes", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Macy's", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "75%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Macy's  -  Nevada", methodOfCollection: "Collection Law Firm", settlementRange: "75%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Macy's  -  Ohio", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "40%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Malen & Assoc", methodOfCollection: "Collection Law Firm", settlementRange: "60%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Mandarich Law", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Mariner Finance", methodOfCollection: "Collection Agency", settlementRange: "55%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Merchants Acceptance", methodOfCollection: "Original Creditor", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Mercury Mastercard", methodOfCollection: "Collection Agency", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Merrick Bank", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Merrick Bank - New York", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Messerli & Kramer", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "lump sum only", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Metabank", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Mid-America Bank & Trust", methodOfCollection: "Collection Agency", settlementRange: "57%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Midland Credit", methodOfCollection: "Collection Agency", settlementRange: "55%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Midland Credit (Legal Accounts)", methodOfCollection: "Collection Law Firm", settlementRange: "50%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Miller & Steeno", methodOfCollection: "Collection Law Firm", settlementRange: "80%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Mobiloans", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Monroe & Main", methodOfCollection: "Original Creditor", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Moore Law", methodOfCollection: "Collection Law Firm", settlementRange: "75%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Morgan & Assoc", methodOfCollection: "Collection Law Firm", settlementRange: "65%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Moss Law", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Mulloly Jeffrey Rooney", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Municipal Credit Solutions", methodOfCollection: "Collection Law Firm", settlementRange: "85%-90%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Naderpour", methodOfCollection: "Collection Law Firm", settlementRange: "76%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Nathan & Nathan", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Navy Federal Credit Union", methodOfCollection: "Original Creditor", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Nelson & Kennard", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "NetCredit", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Nordstrom - Colorado", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Nordstrom - Visa", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Old Navy - Ohio", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Old Navy - Florida", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "One Main Financial", methodOfCollection: "Original Creditor", settlementRange: "45%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Oportun", methodOfCollection: "Collection Law Firm", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Overstock", methodOfCollection: "Collection Agency", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Pennsylvania State Employees Credit Union", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "55%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Patelco Credit Union", methodOfCollection: "Original Creditor", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Patenaude & Felix", methodOfCollection: "Collection Law Firm", settlementRange: "60%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Paypal", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Personify", methodOfCollection: "Collection Agency", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Phillips Cohen - Barclays", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Phillips Cohen - Capital One", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Phillips Cohen - Citibank", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "PNC Bank", methodOfCollection: "Original Creditor", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Portfolio Recovery Associates", methodOfCollection: "Collection Agency", settlementRange: "65%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Premier Bankcard", methodOfCollection: "Original Creditor", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Pressler Felt", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Prosper Loans", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "45%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "RAS LaVrar", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Ratchford Law", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Rausch Sturm", methodOfCollection: "Collection Law Firm", settlementRange: "60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Regional Finance", methodOfCollection: "Collection Agency", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Regions Bank", methodOfCollection: "Collection Agency", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Rise Credit", methodOfCollection: "Original Creditor", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Rubin & Rothman", methodOfCollection: "Collection Law Firm", settlementRange: "70% to 80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Sams Club", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "40%-60%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Santander Bank", methodOfCollection: "Collection Agency", settlementRange: "40%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Schools First Credit Union", methodOfCollection: "Original Creditor", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Scott & Assoc", methodOfCollection: "Collection Law Firm", settlementRange: "70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Sears", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "55%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Second Round", methodOfCollection: "Collection Agency", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Security Finance Corp", methodOfCollection: "Collection Agency", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Selip & Stylianou", methodOfCollection: "Collection Law Firm", settlementRange: "63%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Service Fin Co", methodOfCollection: "Collection Agency", settlementRange: "40%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "SoFi", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "40%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Solomon & Solomon", methodOfCollection: "Collection Law Firm", settlementRange: "68%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Stenger & Stenger", methodOfCollection: "Collection Law Firm", settlementRange: "75%  - 80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Stillman Law", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Suntrust Bank", methodOfCollection: "Collection Agency", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Suttell & Hammer", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Synchrony Bank", methodOfCollection: "Original Creditor/Collection Law Firm/Collection Agency", settlementRange: "40%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Target", methodOfCollection: "Collection Law Firm", settlementRange: "50%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Target/TD Bank", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "TD Bank", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "45%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Tenaglia & Hunt", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Texas Health Resource Credit Union", methodOfCollection: "Collection Agency", settlementRange: "50%-60%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "The Lending Club", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "45%-70%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "The Sportsman Guide Visa", methodOfCollection: "Collection Law Firm", settlementRange: "75%-85%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Toys R Us", methodOfCollection: "Collection Law Firm", settlementRange: "75%-85%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Tromberg Morris & Poulin", methodOfCollection: "Collection Law Firm", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Union Bank", methodOfCollection: "Collection Agency", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Upgrade", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Upstart", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "US Bank", methodOfCollection: "Original Creditor/Collection Law Firm/Collection Agency", settlementRange: "45%-65%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "US Bank Debt Management Plan", methodOfCollection: "Collection Agency", settlementRange: "50%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "USAA Savings Bank", methodOfCollection: "Original Creditor", settlementRange: "40%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Veridian Credit Union", methodOfCollection: "Original Creditor", settlementRange: "70%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Walmart", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Webbank", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "50%-75%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Weber & Olcese", methodOfCollection: "Collection Law Firm", settlementRange: "68%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Wells Fargo", methodOfCollection: "Original Creditor", settlementRange: "45%-55%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Wells Fargo", methodOfCollection: "Collection Agency/Legal Collection", settlementRange: "65%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Weltman Weinberg & Reis", methodOfCollection: "Collection Law Firm", settlementRange: "80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "WFNNB", methodOfCollection: "Original Creditor", settlementRange: "45%-50%", negotiationBasis: "Current Balance", settlementMethod: "Lump sum", lawFirmSettlement: "Typically No", consumerGuidance: "", lastUpdated: "2025-08-25" },
  { creditor: "Zwicker & Assoc - American Express", methodOfCollection: "Collection Law Firm", settlementRange: "70%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Zwicker & Assoc - Discover", methodOfCollection: "Collection Law Firm", settlementRange: "70%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" },
  { creditor: "Zwicker & Assoc - Goldman Sachs", methodOfCollection: "Collection Law Firm", settlementRange: "70%-80%", negotiationBasis: "Current Balance", settlementMethod: "Payment plans accepted", lawFirmSettlement: "Yes", consumerGuidance: "Creditor Profile Requires Legal Plan Support", lastUpdated: "2025-08-25" }
];

export default function CreditorProfilePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCreditors = useMemo(() => {
    if (!searchQuery.trim()) {
      return creditorData;
    }

    const query = searchQuery.toLowerCase();
    return creditorData.filter(creditor =>
      creditor.creditor.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Creditor Profile Tool
            </h1>
            <p className="text-gray-600">
              Search and view detailed creditor information
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by creditor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-black placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {filteredCreditors.length} creditor{filteredCreditors.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCreditors.map((creditor, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="mb-4 text-xl font-bold text-black">
                  {creditor.creditor}
                </h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Settlement Range
                    </p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      {creditor.settlementRange}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Method of Collection
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {creditor.methodOfCollection}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Settlement Method
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {creditor.settlementMethod}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Negotiation Basis
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {creditor.negotiationBasis}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Law Firm Settlement
                    </p>
                    <p className="mt-1">
                      {creditor.lawFirmSettlement === 'Yes' && (
                        <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                          Yes
                        </span>
                      )}
                      {creditor.lawFirmSettlement === 'Typically No' && (
                        <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-900">
                          Typically No
                        </span>
                      )}
                      {creditor.lawFirmSettlement === '' && (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </p>
                  </div>

                  {creditor.consumerGuidance && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Consumer Guidance
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {creditor.consumerGuidance}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">
                      Last Updated: {creditor.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCreditors.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-500">
                No creditors found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
