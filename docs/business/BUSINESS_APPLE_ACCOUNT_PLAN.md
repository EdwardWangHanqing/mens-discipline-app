# Men's Discipline App — Business & Apple Account Plan

**Status:** Parallel business-readiness track

**Last verified:** 2026-08-11

**Goal:** Avoid blocking technical development while ensuring the commercial App Store release is owned and paid to the intended company.

**Authority:** This file governs business/account sequencing only. It must not override `docs/product/MVP_SCOPE.md` or later accepted product decisions.

## 1. Immediate path

### Development can start now
- Enroll in the Apple Developer Program as an **Individual** if company formation is not ready and Family Controls development needs to start.
- Use this same membership for development, certificates, identifiers and prototype work.
- Do **not** publish the commercial App Store version under the individual seller if the intended seller is the company.

### In parallel, form the company
- Decide umbrella company name.
- Incorporate the legal entity.
- Maintain required corporate records for the one-owner corporation.
- Open a business bank account.
- Obtain CRA Business Number / required tax accounts with accountant guidance.
- Register GST/HST as required for Apple paid-app tax setup and the company's tax position.
- Establish bookkeeping, receipt retention and expense reimbursement process.
- Document transfer/assignment of pre-incorporation app IP to the company.

## 2. Company identity needed for Apple Organization membership

- Legal entity name.
- D-U-N-S number.
- Founder/owner authority to bind the company.
- Company-domain work email.
- Public, functional company website associated with that domain.
- Incorporation/business documents available in case Apple requests verification.

## 3. Convert Apple membership

When the company + D-U-N-S are ready:
- Request **Individual → Organization** conversion from Apple Developer Account membership settings/support.
- Keep using the same membership rather than creating a second developer account unless there is a specific reason not to.
- Confirm legal entity/seller information is correct after conversion.
- Confirm existing App IDs, capabilities and App Store Connect app records remain correctly associated.
- Expect possible compliance verification/document requests and respond promptly.

## 4. What NOT to rush before conversion

Because the commercial entity will change, avoid unnecessary duplicate setup under the individual identity unless development truly requires it:
- Paid Apps Agreement.
- Banking information.
- Canadian tax forms.
- App Store Small Business Program enrollment.

Technical development and Family Controls development should proceed; commerce setup can wait until the organization identity is stable.

## 5. Paid Apps / subscription readiness after conversion

Recommended order:
1. Confirm Organization membership / seller identity.
2. Accept current Paid Apps Agreement.
3. Submit required tax information (Canada: GST/HST information required by Apple; additional forms as applicable).
4. Add company bank account.
5. Complete any Apple compliance reviews.
6. Apply to App Store Small Business Program.
7. Create/finalize subscription products and RevenueCat production configuration.
8. Verify Sandbox/TestFlight purchasing.

## 6. App Store Small Business Program

- Target enrollment **before real paid launch**, not as a post-launch cleanup item.
- Eligibility is based on Apple rules including the USD 1M proceeds threshold and Associated Developer Accounts.
- The program applies a reduced 15% commission to eligible paid apps / in-app purchases.
- Enrollment requires the Account Holder and an accepted Paid Apps Agreement.
- Declare all Associated Developer Accounts if any exist.
- Do not assume an Individual enrollment would automatically survive a later legal-entity conversion; our plan avoids that ambiguity by applying after Organization conversion.
- Apple states the adjusted proceeds rate becomes effective after the approval timing defined by its fiscal-calendar rules, so apply with lead time rather than on launch day.

## 7. Company bank / bookkeeping controls

- Apple proceeds → company bank account.
- Company expenses → company card/account where practical.
- Keep all invoices/receipts for Apple Developer fee, Mac/development hardware, Figma, RevenueCat/Superwall if used, domains, hosting, AI assets, Suno/commercial music, contractors/UGC and advertising.
- Keep personal and corporate transactions clearly separated.
- Ask accountant how to record legitimate pre-incorporation development expenses and founder reimbursements.

## 8. Legal/IP file

For a one-founder company, a multi-party shareholder agreement is normally not the main priority. Maintain instead:
- Incorporation documents.
- Director/shareholder resolutions and registers required for the entity.
- Share issuance records.
- Founder IP Assignment for pre-incorporation code/design/product assets if appropriate.
- Contractor IP assignment clauses for future freelancers.
- Asset-license ledger (music, fonts, icons, AI assets, stock media).
- Trademark/domain/brand ownership records.

Use a lawyer/accountant for jurisdiction-specific legal/tax advice when documents or tax treatment become material.

## 9. Website/email minimum

Before Organization verification and launch:
- Company domain.
- Company email on that domain.
- Public functional company page.
- App landing page.
- Privacy Policy.
- Terms of Use / EULA decision.
- Support page/contact email.

## 10. Territory / EU privacy-of-address decision

Before enabling EU App Store territories:
- Complete DSA trader assessment.
- Understand which company contact details will be displayed publicly on EU App Store product pages.
- If public-address exposure is a concern, resolve a compliant business-address strategy before EU launch rather than discovering it during submission.

## 11. Annual business maintenance (separate from App Store release)

Maintain a recurring calendar for:
- Corporate annual filings.
- Corporate tax return / accountant package.
- GST/HST filings if registered/required.
- Bookkeeping reconciliation.
- Apple Developer annual renewal.
- Domain/email renewals.
- Insurance/legal review if the business grows.

This business track runs alongside product development and should not redefine `MVP_SCOPE.md`.
