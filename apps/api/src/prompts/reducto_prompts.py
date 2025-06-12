REDUCTO_PROMPT = """
###You are an expert in reading dental insurance verification documents. You are incredibly precise and thorough. 
###Do not include currencies, commas, percentages, and other formatting. Only output plain numbers.
   
###Recognize and detect poor spreadsheet formatting, there maybe section and line breaks that were not intentional. 

###Recognize that the tables in the documents may contain legends on interpreting its property and details.

###Annual Maximum is the total maximum amount that the insurance company will pay for the year. It is NOT the maximum remaining amount. Annual Maximum is always a positive number, and it is always a whole number.
Annual Maximum Remaining is the remaining amount that the insurance company will pay for the year. It is always a positive number, and it can be a decimal.
Sometimes the document will indirectly mention the Annual Maximum Remaining. For example, "The Annual Maximum is $1000, $300 is used or met". In this case, the Annual Maximum Remaining is $700.
Sometimes the document will indirectly mention the Annual Maximum. For example, "The Annual Maximum Remaining is $500, $1500 is used or met". In this case, the Annual Maximum is $2000.
This same pattern can appear in calculating deductibles as well. For example, "The deductible maximum is $100, $30 is used". In this case, the deductible remaining is $70.

###Insurance Policy Provisions are an extremely important to output into the "other_provisions" section. 
If these following items are stated anywhere in the document, output them into the "other_provisions" section:
Missing Tooth Clause, Missing Tooth Policy, Missing Tooth Limitations, Waiting Periods, Coordination of Benefits, Age Limitations and Restrictions, Dependent eligibility, Student eligibility, Pre-determination, pre-authorization, pre-treatment review instruction, Crown paid on seat date or prep date, Orthodontic Age Limitation Policies, Policy Disclaimers, and Policy Notes.
DO NOT INCLUDE ANY TEXT SEGMENTS THAT SAYS "proprietary", "delete", or anything that is not relevant to the insurance policy.

####Rules for Interpreting Age Restrictions or Age Limitations.
In general, output the age restrictions or age limitations as it is described in the document. Do not make up your own age restrictions or age limitations.

###Determine Network-tier based on explicit information in the document and place the percentages ONLY in the correct network types. The network type indications may sometimes be highlighted, different colors, bold, or other text formatting. 
In-Network is inn_ppo, Out-Of-Network is oon_ppo, Delta Dental Premier is inn_premier. Only assign percentages to identified networks. Only apply inn_premier if and only if the insurance company is Delta Dental and the network is Delta Dental Premier.

###If a limitation is associated with a procedure code but appears in a different section than the procedure code itself (e.g., in a footer, separate table, or a different section of the document), then the limitation must still be extracted and linked to the correct procedure code.
- If a limitation is explicitly stated alongside the procedure code, then include it in the limitations property for that procedure code.
- If a limitation is found elsewhere in the document and applies generally to a category of procedures, then assign it to all relevant procedure codes within that category.
- Limitation description should include any additional information about the limitation that is not already included in the other properties. For example, include the number of quadrants in the same day or downgrades.

###If a frequency limitation is associated with a procedure code, then output the frequency limitation in the limitations property for that procedure code. IT IS IMPORTANT TO NOT SKIP ANY MENTIONS OF FREQUENCY LIMITATIONS IN THE DOCUMENT. The format should loosely follow 'X per Y period'. For example, '1 per 12 months' or '1 per lifetime'. The period can be 'visit', 'year', 'lifetime', 'month', 'date of service', 'provider'. Pay attention to special modifiers such as '1 per 12 consecutive months' or '1 per 12 calendar months' please include the special modifier in the output. Additional examples of the special modifiers are 'consecutive', 'calendar', 'visit', 'date of service', 'provider', and more.

###If a procedure code shares the same frequency limitation as another procedure code, then output the related codes in the shares_frequency_with_procedure_codes property for that procedure code. These related codes are sometimes called related codes, related procedures, or services sharing frequency. 

###If a procedure code does not have an explicit coverage percentages, do not make up your own coverage percentages. If a procedure code is not covered or has no coverage, set the percentage to 0. 

###SERVICE EXTRACTION: Identify all dental services mentioned in the document and categorize them correctly. Extract each service with its coverage details, placing them in either categorized_services or uncategorized_services arrays. 
**For categorized_services, ONLY include services that EXACTLY match these names: "Diagnostic", "Preventive", "Basic", "Major", "Restorative", "Endodontics", "Prosthodontics, removable", "Maxillofacial Prosthetics", "Implant Services", "Prosthodontics, fixed", "Oral & Maxillofacial Surgery", "Orthodontics", "Adjunctive General Services", "Periodontics".**
**For uncategorized_services, include ANY service mentioned that does not exactly match the categorized service names listed above. IT IS EXTREMELY IMPORTANT TO NOT SKIP ANY SERVICES IN THE DOCUMENT. CATEGORIZED SERVICES AND UNCATEGORIZED SERVICES ARE OFTEN FOUND TOGETHER IN THE DOCUMENT.**
For EACH service (both categorized and uncategorized), extract ALL available properties:
- service_name: The exact name of the service as it appears in the document
- service_deductible_applies: Set to true if explicitly stated a deductible applies; false otherwise
- service_limitation: Any limitations specifically mentioned for this service (e.g., "1 per 6 months")
- service_percentages: Coverage percentages for different networks, including:
  * inn_ppo_lower and inn_ppo_upper: In-network PPO percentages (use the same value for both if only one percentage is mentioned)
  * inn_premier_lower and inn_premier_upper: In-network Premier percentages (only for Delta Dental Premier)
  * oon_ppo_lower and oon_ppo_upper: Out-of-network PPO percentages (use the same value for both if only one percentage is mentioned)
- service_waiting_period_duration: Waiting period in months before coverage begins, if mentioned
Pay attention to headers, tables, and footnotes where service information is commonly presented. When percentages are presented as ranges (e.g., "80-100%"), use the lower value for _lower and higher value for _upper fields. If only one percentage is given, use the same value for both _lower and _upper fields. NEVER invent or assume percentages not explicitly stated in the document.

###If a procedure code contains patient treatment history, then output the treatment history into the "treatment_history" property ONLY. Treatment history includes past services and future eligibility information, and may be labeled as: "Last Visit," "Last Treatment," "Treatment History," "Previous Services," "Date Last Completed," "Last Date of Service," "Next Available Date," "Next Effective Date," "Next Eligible Date," "Available After," "Visits Remaining," "Treatments Remaining," "Treatment Areas Remaining," "Frequency Remaining," "Services Remaining," "Number Remaining," or "Remaining Benefit." Extract ALL available components including: date of service (past dates), next available/effective dates (future dates), number of visits/treatments/areas remaining, dental procedure code, tooth number, tooth surface, tooth description, or area of mouth. Treatment history information must ONLY be placed in the "treatment_history" property within the procedure code object it relates to, and NEVER in any other property of the extraction output. Do not confuse any of the dates listed on the document with the dates of services or next available dates; only output the date if you are certain.


###Pay special attention to procedure codes in the list below. Regardless of whether or not the procedure is in the list below, if it is mentioned in the document, it should be included in the output. The format for the list below is organized by "procedure_code", "procedure_code_description".
This is the list of very important dental procedure codes and their descriptions. Use the descriptions to improve referencing associated information. NEVER SKIP ANY PROCEDURE CODES IN THE DOCUMENT.

procedure_code	procedure_code_description
D0120	Periodic oral evaluation - established patient
D0140	Limited oral evaluation - problem focused
D0145	Oral evaluation for a patient under three years of age and counseling with primary caregiver
D0150	Comprehensive oral evaluation - new or established patient
D0160	Detailed and extensive oral evaluation - problem focused, by report
D0170	Re-evaluation - limited, problem focused (established patient; not post-operative visit)
D0171	Re-evaluation – post-operative office visit
D0180	Comprehensive periodontal evaluation - new or established patient
D0190	Screening of a patient
D0191	Assessment of a patient
D0210	Intraoral - comprehensive series of radiographic images
D0220	Intraoral - periapical first radiographic image
D0230	Intraoral - periapical each additional radiographic image
D0240	Intraoral - occlusal radiographic image
D0250	Extra-oral – 2D projection radiographic image created using a stationary radiation source and detector.
D0251	Extra-oral posterior dental radiographic image
D0260	Extraoral - Each Additional Film
D0270	Bitewing - single radiographic image
D0272	Bitewings - two radiographic images
D0273	Bitewings - three radiographic images
D0274	Bitewings - four radiographic images
D0277	Vertical bitewings - 7 to 8 radiographic images
D0290	Posterior-anterior or lateral skull and facial bone survey film
D0310	Sialography
D0320	Temporomandibular joint arthrogram, including injection
D0321	Other temporomandibular joint radiographic images, by report
D0322	Tomographic survey
D0330	Panoramic radiographic image
D0340	2d cephalometric radiographic image – acquisition, measurement and analysis
D0350	2d oral/facial photographic image obtained intra-orally or extra-orally
D0351	3d photographic image
D0360	Cone Beam CT – Craniofacial Data Capture
D0362	Cone beam – two-dimensional image reconstruction using existing data; includes multiple images.
D0363	Cone beam – Three-dimensional image reconstruction using existing data; includes multiple images.
D0364	Cone beam CT capture and interpretation with limited field of view – less than one whole jaw
D0365	Cone beam CT capture and interpretation with field of view of one full dental arch – mandible
D0366	Cone beam CT capture and interpretation with field of view of one full dental arch – maxilla, with or without cranium
D0367	Cone beam CT capture and interpretation with field of view of both jaws; with or without cranium
D0368	Cone beam CT capture and interpretation for TMJ series including two or more exposures
D0369	Maxillofacial MRI capture and interpretation
D0370	Maxillofacial ultrasound capture and interpretation
D0371	Sialoendoscopy capture and interpretation
D0372	Intraoral Tomosynthesis – Comprehensive Series of Radiographic Images
D0373	Intraoral Tomosynthesis – Bitewing Radiographic Image
D0374	Intraoral Tomosynthesis – Periapical Radiographic Image
D0380	Cone beam CT image capture with limited field of view – less than one whole jaw
D0381	Cone beam CT image capture with field of view of one full dental arch – mandible
D0382	Cone beam CT image capture of the maxillary dental arch, providing detailed 3D views for accurate diagnosis and treatment planning.
D0383	Cone beam CT image capture with field of view of both jaws; with or without cranium
D0384	Cone beam CT image capture for TMJ series including two or more exposures
D0385	Maxillofacial MRI image capture
D0386	Maxillofacial ultrasound image capture
D0387	Intraoral Tomosynthesis – Comprehensive Series of Radiographic Images – Image Capture Only
D0388	Intraoral Tomosynthesis – Bitewing Radiographic Image – Image Capture Only
D0389	Intraoral Tomosynthesis – Periapical Radiographic Image – Image Capture Only
D0391	Interpretation of diagnostic image by a practitioner not associated with capture of the image, including report
D0393	Virtual treatment simulation using 3D image volume or surface scan.
D0394	Digital subtraction of two or more images or image volumes of the same modality
D0395	Fusion of two or more 3D image volumes of one or more modalities
D0411	HbA1c in-office point of service testing
D0412	Blood glucose level test – in-office using a glucose meter
D0414	Laboratory processing of microbial specimen to include culture and sensitivity studies, preparation and transmission of written report.
D0415	Collection of microorganisms for culture and sensitivity
D0416	Viral culture
D0417	Collection and preparation of saliva sample for laboratory diagnostic testing.
D0418	Analysis of saliva sample
D0419	Assessment of salivary flow by measurement
D0421	Genetic Test for Susceptibility to Oral Diseases
D0422	Collection and preparation of genetic sample material for laboratory analysis and report
D0423	Genetic test for susceptibility to diseases – specimen analysis
D0425	Caries susceptibility tests
D0431	Adjunctive pre-diagnostic test that aids in detection of mucosal abnormalities including premalignant and malignant lesions, not to include cytology or biopsy procedures.
D0460	Pulp vitality tests
D0470	Diagnostic casts
D0472	Accession of tissue, gross examination, preparation and transmission of written report
D0473	Accession of tissue, gross and microscopic examination, preparation and transmission of written report
D0474	Accession of tissue, gross and microscopic examination, including assessment of surgical margins for presence of disease, preparation and transmission of written report.
D0475	Decalcification procedure
D0476	Special stains for microorganisms
D0477	Special stains, not for microorganisms.
D0478	Immunohistochemical stains
D0479	Tissue in-situ hybridization, including interpretation
D0480	Accession of exfoliative cytologic smears, microscopic examination, preparation and transmission of written report.
D0481	Electron microscopy for dental diagnostics
D0482	Direct immunofluorescence
D0483	Indirect immunofluorescence
D0484	Consultation on slides prepared elsewhere
D0485	Consultation, including preparation of slides from biopsy material supplied by referring source.
D0486	Laboratory accession of transepithelial cytologic sample, microscopic examination, preparation and transmission of written report.
D0502	Other oral pathology procedures, by report
D0600	Non-ionizing diagnostic procedure capable of quantifying, monitoring, and recording changes in structure of enamel, dentin, and cementum.
D0601	Caries risk assessment and documentation, with a finding of low risk
D0602	Caries risk assessment and documentation, with a finding of moderate risk.
D0603	Caries risk assessment and documentation, with a finding of high risk.
D0604	Antigen testing for a public health related pathogen, including coronavirus
D0605	Antibody testing for a public health related pathogen, including coronavirus
D0606	Molecular testing for a public health-related pathogen, including coronavirus.
D0701	Panoramic radiographic image – image capture only
D0702	2-D cephalometric radiographic image – image capture only
D0703	2-D oral/facial photographic image obtained intra-orally or extra-orally – image capture only
D0704	3-D photographic image – image capture only
D0705	Extra-oral posterior dental radiographic image – image capture only
D0706	Intraoral – occlusal radiographic image – image capture only
D0707	Intraoral – periapical radiographic image – image capture only
D0708	Intraoral – bitewing radiographic image – image capture only
D0709	Intraoral – complete series of radiographic images – image capture only
D0801	3D Dental Surface Scan – Direct
D0802	3D Dental Surface Scan – Indirect
D0803	3D Facial Surface Scan – Direct
D0804	3D Facial Surface Scan – Indirect
D0999	Unspecified diagnostic procedure, by report
D1110	Prophylaxis - adult
D1120	Prophylaxis - child
D1203	Topical Application of Fluoride - Child
D1204	Topical Application of Fluoride - Adult
D1206	Topical application of fluoride varnish
D1208	Topical application of fluoride – excluding varnish
D1310	Nutritional counseling for control of dental disease
D1320	Tobacco counseling for the control and prevention of oral disease
D1321	Counseling for the control and prevention of adverse oral, behavioral, and systemic health effects associated with high-risk substance use.
D1330	Oral hygiene instructions
D1351	Sealant - per tooth
D1352	Preventive resin restoration in a moderate to high caries risk patient – permanent tooth
D1353	Sealant repair – per tooth
D1354	Interim caries arresting medicament application – per tooth
D1355	Caries preventive medicament application – per tooth
D1510	Space maintainer - fixed, unilateral – per quadrant
D1515	Space Maintainer - Fixed - Bilateral
D1516	Space maintainer - fixed - bilateral, maxillary
D1517	Space maintainer - fixed - bilateral, mandibular
D1520	Space maintainer - removable, unilateral - per quadrant
D1525	Space Maintainer - Removable - Bilateral
D1526	Space maintainer - removable - bilateral, maxillary
D1527	Space maintainer - removable - bilateral, mandibular
D1550	Re-cementation of Space Maintainer
D1551	Re-cement or re-bond bilateral space maintainer - maxillary
D1552	Re-cement or re-bond bilateral space maintainer - mandibular
D1553	Re-cement or re-bond unilateral space maintainer - per quadrant
D1555	Removal of fixed space maintainer.
D1556	Removal of fixed unilateral space maintainer - per quadrant
D1557	Removal of fixed bilateral space maintainer - maxillary
D1558	Removal of fixed bilateral space maintainer - mandibular
D1575	Distal shoe space maintainer - fixed, unilateral - per quadrant
D1701	Pfizer-BioNTech COVID-19 vaccine administration – First dose
D1702	Pfizer-BioNTech COVID-19 vaccine administration – second dose
D1703	Moderna COVID-19 vaccine administration – First dose
D1704	Moderna COVID-19 vaccine administration – Second dose
D1705	AstraZeneca COVID-19 vaccine administration – First dose
D1706	AstraZeneca COVID-19 vaccine administration – Second dose
D1707	Janssen COVID-19 vaccine administration
D1708	Pfizer-BioNTech COVID-19 vaccine administration – third dose
D1709	Pfizer-BioNTech COVID-19 vaccine administration – Booster dose
D1710	Moderna COVID-19 vaccine administration – third dose
D1711	Moderna COVID-19 vaccine administration – booster dose
D1712	Janssen COVID-19 Vaccine Administration - Booster Dose
D1713	Pfizer-BioNTech COVID-19 Vaccine Administration Tris-Sucrose Pediatric – First Dose
D1714	Pfizer-BioNTech COVID-19 Vaccine Administration Tris-Sucrose Pediatric – Second Dose
D1781	Vaccine Administration – Human Papillomavirus – Dose 1
D1782	Vaccine Administration – Human Papillomavirus – Dose 2
D1783	Vaccine Administration – Human Papillomavirus – Dose 3
D1999	Unspecified preventive procedure, by report
D2140	Amalgam - one surface, primary or permanent
D2150	Amalgam - two surfaces, primary or permanent
D2160	Amalgam - three surfaces, primary or permanent
D2161	Amalgam - four or more surfaces, primary or permanent
D2330	Resin-based composite - one surface, anterior
D2331	Resin-based composite - two surfaces, anterior
D2332	Resin-based composite - three surfaces, anterior
D2335	Resin-based composite - four or more surfaces or involving incisal angle (anterior)
D2390	Resin-based composite crown, anterior
D2391	Resin-based composite - one surface, posterior
D2392	Resin-based composite - two surfaces, posterior
D2393	Resin-based composite - three surfaces, posterior
D2394	Resin-based composite - four or more surfaces, posterior
D2410	Gold foil fillings - one surface
D2420	Gold foil fillings - two surfaces
D2430	Gold foil fillings - three surfaces
D2510	Metallic inlay restoration
D2520	Inlay - metallic - two surfaces
D2530	Inlay - metallic - three or more surfaces
D2542	Onlay - metallic - two surfaces
D2543	Onlay - metallic - three surfaces
D2544	Onlay - metallic - four or more surfaces
D2610	Inlay - porcelain/ceramic - one surface
D2620	Inlay - porcelain/ceramic - two surfaces
D2630	Inlay - porcelain/ceramic - three or more surfaces
D2642	Onlay - porcelain/ceramic - two surfaces
D2643	Onlay - porcelain/ceramic - three surfaces
D2644	Porcelain/ceramic onlay - four or more surfaces
D2650	Inlay - resin-based composite - one surface
D2651	Inlay - resin-based composite - two surfaces
D2652	Inlay - resin-based composite - three or more surfaces
D2662	Onlay - resin-based composite - two surfaces
D2663	Onlay - resin-based composite - three surfaces
D2664	Onlay - resin-based composite - four or more surfaces
D2710	Crown - resin-based composite (indirect)
D2712	Crown - ¾ resin-based composite (indirect)
D2720	Crown - resin with high noble metal
D2721	Crown - resin with predominantly base metal
D2722	Crown - resin with noble metal
D2740	Crown - porcelain/ceramic
D2750	Crown - porcelain fused to high noble metal
D2751	Crown - porcelain fused to predominantly base metal
D2752	Crown - porcelain fused to noble metal
D2753	Crown - porcelain fused to titanium and titanium alloys
D2780	Crown - 3/4 cast high noble metal
D2781	Crown - 3/4 cast predominantly base metal
D2782	Crown - 3/4 cast noble metal
D2783	Crown - 3/4 porcelain/ceramic
D2790	Crown - full cast high noble metal
D2791	Crown - full cast predominantly base metal
D2792	Crown - full cast noble metal
D2794	Crown - titanium and titanium alloys
D2799	Interim crown – further treatment or completion of diagnosis necessary prior to final impression
D2910	Re-cement or re-bond inlay, onlay, veneer, or partial coverage restoration
D2915	Re-cement or re-bond indirectly fabricated or prefabricated post and core
D2920	Re-cement or re-bond crown
D2921	Reattachment of tooth fragment, incisal edge or cusp
D2928	Prefabricated porcelain/ceramic crown – permanent tooth
D2929	Prefabricated porcelain/ceramic crown for primary teeth
D2930	Prefabricated stainless steel crown - primary tooth
D2931	Prefabricated stainless steel crown - permanent tooth
D2932	Prefabricated resin crown
D2933	Prefabricated stainless steel crown with resin window
D2934	Prefabricated esthetic coated stainless steel crown - primary tooth
D2940	Protective restoration
D2941	Interim therapeutic restoration - primary dentition
D2949	Restorative foundation for an indirect restoration
D2950	Core buildup, including any pins when required
D2951	Pin retention - per tooth, in addition to restoration
D2952	Post and core in addition to crown, indirectly fabricated
D2953	Each additional indirectly fabricated post - same tooth
D2954	Prefabricated post and core in addition to crown
D2955	Post removal
D2957	Each additional prefabricated post - same tooth
D2960	Labial veneer (resin laminate) - direct
D2961	Labial veneer (resin laminate) - indirect
D2962	Labial veneer (porcelain laminate) - indirect
D2970	Temporary Crown (Fractured Tooth)
D2971	Additional procedures to customize a crown to fit under an existing partial denture framework.
D2975	Coping
D2980	Crown repair necessitated by restorative material failure
D2981	Inlay repair necessitated by restorative material failure
D2982	Onlay repair necessitated by restorative material failure
D2983	Veneer repair necessitated by restorative material failure
D2990	Resin infiltration of incipient smooth surface lesions
D2999	Unspecified restorative procedure, by report.
D3110	Pulp cap - direct (excluding final restoration)
D3120	Pulp cap - indirect (excluding final restoration)
D3220	Therapeutic pulpotomy (excluding final restoration) - removal of pulp coronal to the dentinocemental junction and application of medicament
D3221	Pulpal debridement, primary and permanent teeth
D3222	Partial pulpotomy for apexogenesis - permanent tooth with incomplete root development
D3230	Pulpal therapy (resorbable filling) - anterior, primary tooth (excluding final restoration)
D3240	Pulpal therapy (resorbable filling) - posterior, primary tooth (excluding final restoration)
D3310	Endodontic therapy, anterior tooth (excluding final restoration)
D3320	Endodontic therapy, premolar tooth (excluding final restoration)
D3330	Endodontic therapy, molar tooth (excluding final restoration)
D3331	Treatment of root canal obstruction; non-surgical access
D3332	Incomplete endodontic therapy; inoperable, unrestorable or fractured tooth
D3333	Internal root repair of perforation defects
D3346	Retreatment of previous root canal therapy - anterior
D3347	Retreatment of previous root canal therapy - premolar
D3348	Retreatment of previous root canal therapy - molar
D3351	Apexification/recalcification – initial visit (apical closure/calcific repair of perforations, root resorption, etc.)
D3352	Apexification/recalcification – interim medication replacement
D3353	Apexification/recalcification - final visit (includes completed root canal therapy - apical closure/calcific repair of perforations, root resorption, etc.)
D3354	Pulpal Regeneration – (Completion of regenerative treatment in an immature permanent tooth with a necrotic pulp); does not include final restoration.
D3355	Pulpal regeneration - initial visit
D3356	Pulpal regeneration - interim medication replacement
D3357	Pulpal regeneration - completion of treatment
D3410	Apicoectomy - anterior
D3421	Apicoectomy - premolar (first root)
D3425	Apicoectomy - molar (first root)
D3426	Apicoectomy (each additional root)
D3427	Periradicular Surgery Without Apicoectomy
D3428	Bone graft in conjunction with periradicular surgery – per tooth, single site
D3429	Bone graft in conjunction with periradicular surgery – each additional contiguous tooth in the same surgical site
D3430	Retrograde filling - per root
D3431	Biologic materials to aid in soft and osseous tissue regeneration in conjunction with periradicular surgery.
D3432	Guided tissue regeneration, resorbable barrier, per site, in conjunction with periradicular surgery.
D3450	Root amputation - per root
D3460	Endodontic endosseous implant
D3470	Intentional re-implantation (including necessary splinting)
D3471	Surgical repair of root resorption - anterior
D3472	Surgical repair of root resorption – premolar
D3473	Surgical repair of root resorption – molar
D3501	Surgical exposure of root surface without apicoectomy or repair of root resorption – anterior
D3502	Surgical exposure of root surface without apicoectomy or repair of root resorption – premolar
D3503	Surgical exposure of root surface without apicoectomy or repair of root resorption – molar
D3910	Surgical procedure for isolation of tooth with rubber dam
D3911	Intra-Orifice Barrier
D3920	Hemisection (including any root removal), not including root canal therapy
D3921	Decoronation or submergence of an erupted tooth.
D3950	Canal preparation and fitting of preformed dowel or post
D3999	Unspecified endodontic procedure, by report
D4210	Gingivectomy or gingivoplasty - four or more contiguous teeth or tooth-bounded spaces per quadrant
D4211	Gingivectomy or gingivoplasty - one to three contiguous teeth or tooth-bounded spaces per quadrant
D4212	Gingivectomy or gingivoplasty to allow access for restorative procedure, per tooth
D4230	Anatomical crown exposure – four or more contiguous teeth or tooth-bounded spaces per quadrant
D4231	Anatomical crown exposure – one to three teeth or tooth-bounded spaces per quadrant
D4240	Gingival flap procedure, including root planing - four or more contiguous teeth or tooth bounded spaces per quadrant
D4241	Gingival flap procedure, including root planing - one to three contiguous teeth or tooth bounded spaces per quadrant
D4245	Apically positioned flap
D4249	Clinical crown lengthening – hard tissue
D4260	Osseous surgery (including elevation of a full thickness flap and closure) – four or more contiguous teeth or tooth bounded spaces per quadrant
D4261	Osseous surgery (including elevation of a full thickness flap and closure) – one to three contiguous teeth or tooth bounded spaces per quadrant
D4263	Bone replacement graft – retained natural tooth – first site in quadrant
D4264	Bone replacement graft – retained natural tooth – each additional site in quadrant
D4265	Biologic materials to aid in soft and osseous tissue regeneration, per site
D4266	Guided tissue regeneration - resorbable barrier, per site
D4267	Guided tissue regeneration - nonresorbable barrier, per site (includes membrane removal)
D4268	Surgical revision procedure, per tooth
D4270	Pedicle soft tissue graft procedure
D4271	Free Soft Tissue Graft Procedure (Including Donor Site Surgery)
D4273	Autogenous connective tissue graft procedure (including donor and recipient surgical sites) first tooth, implant, or edentulous tooth position in graft
D4274	Mesial/distal wedge procedure, single tooth (when not performed in conjunction with surgical procedures in the same anatomical area)
D4275	Non-autogenous connective tissue graft (including recipient site and donor material) first tooth, implant, or edentulous tooth position in graft
D4276	Combined connective tissue and double pedicle graft, per tooth
D4277	Free soft tissue graft procedure (including recipient and donor surgical sites) first tooth, implant or edentulous tooth position in graft
D4278	Free soft tissue graft procedure (including recipient and donor surgical sites) each additional contiguous tooth, implant, or edentulous tooth position in same graft site
D4283	Autogenous connective tissue graft procedure (including donor and recipient surgical sites) – each additional contiguous tooth, implant or edentulous tooth position in same graft site
D4285	Non-autogenous connective tissue graft procedure (including recipient surgical site and donor material) – each additional contiguous tooth, implant or edentulous tooth position in same graft site
D4286	Removal of non-resorbable barrier
D4320	Provisional splinting - intracoronal
D4321	Provisional splinting - extracoronal
D4322	Splint – Intra-coronal; natural teeth or prosthetic crowns
D4323	Splint – Extra-coronal; natural teeth or prosthetic crowns
D4341	Periodontal scaling and root planing - four or more teeth per quadrant
D4342	Periodontal scaling and root planing - one to three teeth per quadrant
D4346	Scaling in presence of generalized moderate or severe gingival inflammation – full mouth, after oral evaluation
D4355	Full mouth debridement to enable a comprehensive periodontal evaluation and diagnosis on a subsequent visit
D4381	Localized delivery of antimicrobial agents via a controlled release vehicle into diseased crevicular tissue, per tooth.
D4910	Periodontal maintenance
D4920	Unscheduled dressing change (by someone other than treating dentist or their staff)
D4921	Gingival irrigation with a medicinal agent – per quadrant
D4999	Unspecified periodontal procedure, by report
D5110	Complete denture - maxillary
D5120	Complete denture - mandibular
D5130	Immediate denture - maxillary
D5140	Immediate denture - mandibular
D5211	Maxillary partial denture – resin base (including retentive/clasping materials, rests, and teeth)
D5212	Mandibular partial denture – resin base (including retentive/clasping materials, rests, and teeth)
D5213	Maxillary partial denture - cast metal framework with resin denture bases (including retentive/clasping materials, rests and teeth)
D5214	Mandibular partial denture - cast metal framework with resin denture bases (including retentive/clasping materials, rests and teeth)
D5221	Immediate maxillary partial denture - resin base (including retentive/clasping materials, rests and teeth)
D5222	Immediate mandibular partial denture - resin base (including retentive/clasping materials, rests and teeth)
D5223	Immediate maxillary partial denture - cast metal framework with resin denture bases (including retentive/clasping materials, rests and teeth)
D5224	Immediate mandibular partial denture - cast metal framework with resin denture bases (including retentive/clasping materials, rests and teeth)
D5225	Maxillary partial denture - flexible base (including retentive/clasping materials, rests, and teeth)
D5226	Mandibular partial denture - flexible base (including retentive/clasping materials, rests, and teeth)
D5227	Immediate maxillary partial denture - Flexible base (including any clasps, rests, and teeth)
D5228	Immediate Mandibular Partial Denture - Flexible Base (including any clasps, rests, and teeth)
D5281	Removable Unilateral Partial Denture - One Piece Cast Metal (Including Clasps and Teeth)
D5282	Removable unilateral partial denture – one piece cast metal (including retentive/clasping materials, rests, and teeth), maxillary
D5283	Removable unilateral partial denture – one piece cast metal (including retentive/clasping materials, rests, and teeth), mandibular
D5284	Removable unilateral partial denture – one piece flexible base (including retentive/clasping materials, rests, and teeth) – per quadrant
D5286	Removable unilateral partial denture – one piece resin (including retentive/clasping materials, rests, and teeth) – per quadrant
D5410	Adjust complete denture - maxillary
D5411	Adjust complete denture - mandibular
D5421	Adjust partial denture - maxillary
D5422	Adjust partial denture - mandibular
D5510	Repair broken complete denture base.
D5511	Repair broken complete denture base, mandibular
D5512	Repair broken complete denture base, maxillary
D5520	Replace missing or broken teeth - complete denture (each tooth)
D5610	Repair Resin Denture Base
D5611	Repair resin partial denture base, mandibular
D5612	Repair resin partial denture base, maxillary
D5620	Repair Cast Framework
D5621	Repair cast partial framework, mandibular
D5622	Repair cast partial framework, maxillary
D5630	Repair or replace broken retentive clasping materials – per tooth
D5640	Replace broken teeth - per tooth
D5650	Add tooth to existing partial denture.
D5660	Add clasp to existing partial denture - per tooth
D5670	Replace all teeth and acrylic on cast metal framework (maxillary).
D5671	Replace all teeth and acrylic on cast metal framework (mandibular).
D5710	Rebase complete maxillary denture
D5711	Rebase complete mandibular denture
D5720	Rebase maxillary partial denture
D5721	Rebase mandibular partial denture
D5725	Rebase Hybrid Prosthesis
D5730	Reline complete maxillary denture (direct)
D5731	Reline complete mandibular denture (direct)
D5740	Reline maxillary partial denture (direct)
D5741	Reline Mandibular Partial Denture (Direct)
D5750	Reline complete maxillary denture (indirect)
D5751	Reline complete mandibular denture (indirect)
D5760	Reline maxillary partial denture (indirect)
D5761	Reline mandibular partial denture (indirect)
D5765	Soft Liner for Complete or Partial Removable Denture – Indirect
D5810	Interim complete denture (maxillary)
D5811	Interim complete denture (mandibular)
D5820	Interim partial denture (including retentive/clasping materials, rests, and teeth), maxillary
D5821	Interim partial denture (including retentive/clasping materials, rests, and teeth), mandibular
D5850	Tissue conditioning, maxillary
D5851	Tissue conditioning, mandibular
D5860	Overdenture - Complete, by Report
D5861	Overdenture - Partial, by Report
D5862	Precision attachment, by report
D5863	Overdenture – complete maxillary
D5864	Overdenture – partial maxillary
D5865	Overdenture – complete mandibular
D5866	Overdenture – partial mandibular
D5867	Replacement of replaceable part of semi-precision or precision attachment (male or female component)
D5875	Modification of removable prosthesis following implant surgery
D5876	Add metal substructure to acrylic full denture (per arch)
D5899	Unspecified removable prosthodontic procedure, by report
D5911	Facial moulage (sectional)
D5912	Facial moulage (complete)
D5913	Nasal prosthesis
D5914	Auricular prosthesis
D5915	Orbital prosthesis
D5916	Ocular prosthesis
D5919	Facial prosthesis
D5922	Nasal septal prosthesis
D5923	Ocular prosthesis, interim
D5924	Cranial prosthesis
D5925	Facial augmentation implant prosthesis
D5926	Nasal prosthesis, replacement
D5927	Auricular prosthesis, replacement
D5928	Orbital prosthesis, replacement
D5929	Facial prosthesis, replacement
D5931	Obturator prosthesis, surgical
D5932	Obturator prosthesis, definitive
D5933	Obturator prosthesis, modification
D5934	Mandibular resection prosthesis with guide flange
D5935	Mandibular resection prosthesis without guide flange
D5936	Obturator prosthesis, interim
D5937	Trismus appliance (not for TMD treatment)
D5951	Feeding aid
D5952	Speech aid prosthesis for pediatric patients
D5953	Speech aid prosthesis for adults
D5954	Palatal augmentation prosthesis
D5955	Palatal lift prosthesis, definitive
D5958	Palatal lift prosthesis, interim
D5959	Palatal lift prosthesis modification
D5960	Speech aid prosthesis modification
D5982	Surgical stent
D5983	Radiation carrier
D5984	Radiation shield
D5985	Radiation cone locator
D5986	Fluoride gel carrier
D5987	Commissure splint
D5988	Surgical splint
D5991	Vesiculobullous disease medicament carrier
D5992	Adjust maxillofacial prosthetic appliance, by report
D5993	Maintenance and cleaning of a maxillofacial prosthesis (extra- or intra-oral) other than required adjustments, by report
D5994	Periodontal Medicament Carrier with Peripheral Seal – Laboratory Processed
D5995	Periodontal medicament carrier with peripheral seal – laboratory processed – maxillary
D5996	Periodontal medicament carrier with peripheral seal – laboratory processed – mandibular
D5999	Unspecified maxillofacial prosthesis, by report
D6010	Surgical placement of implant body: endosteal implant
D6011	Surgical access to an implant body (second stage implant surgery)
D6012	Surgical placement of interim implant body for transitional prosthesis - endosteal implant
D6013	Surgical placement of mini implant
D6040	Surgical placement: eposteal implant
D6050	Surgical placement: transosteal implant
D6051	Interim Implant Abutment Placement
D6052	Semi-Precision Attachment Abutment
D6053	Implant/Abutment Supported Removable Denture for Completely Edentulous Arch
D6054	Implant/Abutment Supported Removable Denture for Partially Edentulous Arch
D6055	Connecting bar – implant supported or abutment supported
D6056	Prefabricated abutment – includes modification and placement
D6057	Custom fabricated abutment – includes placement
D6058	Abutment supported porcelain/ceramic crown
D6059	Abutment supported porcelain fused to metal crown (high noble metal)
D6060	Abutment supported porcelain fused to metal crown (predominantly base metal)
D6061	Abutment supported porcelain fused to metal crown (noble metal)
D6062	Abutment supported cast metal crown (high noble metal)
D6063	Abutment supported cast metal crown (predominantly base metal)
D6064	Abutment supported cast metal crown (noble metal)
D6065	Implant supported porcelain/ceramic crown
D6066	Implant supported crown - porcelain fused to high noble alloys
D6067	Implant supported crown - high noble alloys
D6068	Abutment supported retainer for porcelain/ceramic FPD
D6069	Abutment supported retainer for porcelain fused to metal FPD (high noble metal)
D6070	Abutment supported retainer for porcelain fused to metal FPD (predominantly base metal)
D6071	Abutment supported retainer for porcelain fused to metal FPD (noble metal)
D6072	Abutment supported retainer for cast metal FPD (high noble metal)
D6073	Abutment supported retainer for cast metal FPD (predominantly base metal)
D6074	Abutment supported retainer for cast metal FPD (noble metal)
D6075	Implant supported retainer for ceramic FPD
D6076	Implant supported retainer for FPD - porcelain fused to high noble alloys
D6077	Implant supported retainer for metal FPD - high noble alloys
D6078	Implant/Abutment Supported Fixed Denture for Completely Edentulous Arch
D6079	Implant/Abutment Supported Fixed Denture for Partially Edentulous Arch
D6080	Implant maintenance procedures when prostheses are removed and reinserted, including cleansing of prostheses and abutments.
D6081	Scaling and debridement in the presence of inflammation or mucositis of a single implant, including cleaning of the implant surfaces, without flap entry and closure.
D6082	Implant supported crown - porcelain fused to predominantly base alloys
D6083	Implant supported crown - porcelain fused to noble alloys
D6084	Implant supported crown - porcelain fused to titanium and titanium alloys
D6085	Interim implant crown
D6086	Implant supported crown - predominantly base alloys
D6087	Implant supported crown - noble alloys
D6088	Implant supported crown - titanium and titanium alloys
D6090	Repair implant supported prosthesis, by report
D6091	Replacement of replaceable part of semi-precision or precision attachment (male or female component) of implant/abutment supported prosthesis, per attachment
D6092	Re-cement or re-bond implant/abutment supported crown
D6093	Re-cement or re-bond implant/abutment supported fixed partial denture
D6094	Abutment supported crown - titanium and titanium alloys
D6095	Repair implant abutment, by report
D6096	Remove broken implant retaining screw.
D6097	Abutment supported crown - porcelain fused to titanium and titanium alloys
D6098	Implant supported retainer - porcelain fused to predominantly base alloys
D6099	Implant supported retainer for FPD - porcelain fused to noble alloys
D6100	Surgical removal of implant body.
D6101	Debridement of a peri-implant defect or defects surrounding a single implant, and surface cleaning of the exposed implant surfaces, including flap entry and closure.
D6102	Debridement and osseous contouring of a peri-implant defect or defects surrounding a single implant and includes surface cleaning of the exposed implant surfaces, including flap entry and closure.
D6103	Bone graft for repair of peri-implant defect – does not include flap entry and closure
D6104	Bone graft at time of implant placement
D6105	Removal of implant body not requiring bone removal or flap elevation.
D6106	Guided tissue regeneration – resorbable barrier, per implant
D6107	Guided Tissue Regeneration – Non-Resorbable Barrier, Per Implant
D6110	Implant/abutment supported removable denture for edentulous arch – maxillary
D6111	Implant/abutment supported removable denture for edentulous arch – mandibular
D6112	Implant/abutment supported removable denture for partially edentulous arch – maxillary
D6113	Implant/abutment supported removable denture for partially edentulous arch – mandibular
D6114	Implant/abutment supported fixed denture for edentulous arch – maxillary
D6115	Implant/abutment supported fixed denture for edentulous arch – mandibular
D6116	Implant/abutment supported fixed denture for partially edentulous arch – maxillary
D6117	Implant/abutment supported fixed denture for partially edentulous arch – mandibular
D6118	Implant/abutment supported interim fixed denture for edentulous arch – mandibular
D6119	Implant/abutment supported interim fixed denture for edentulous arch – maxillary
D6120	Implant supported retainer – porcelain fused to titanium and titanium alloys
D6121	Implant supported retainer for metal FPD – predominantly base alloys
D6122	Implant supported retainer for metal FPD – noble alloys
D6123	Implant supported retainer for metal FPD – titanium and titanium alloys
D6190	Radiographic/surgical implant index, by report
D6191	Semi-precision abutment – placement
D6192	Semi-precision attachment – placement
D6194	Abutment supported retainer crown for FPD – titanium and titanium alloys
D6195	Abutment supported retainer - porcelain fused to titanium and titanium alloys
D6197	Replacement of restorative material used to close an access opening of a screw-retained implant-supported prosthesis, per implant.
D6198	Remove interim implant component.
D6199	Unspecified implant procedure, by report
D6205	Pontic - indirect resin based composite
D6210	Pontic - cast high noble metal
D6211	Pontic - cast predominantly base metal
D6212	Pontic - cast noble metal
D6214	Pontic - titanium and titanium alloys
D6240	Pontic - porcelain fused to high noble metal
D6241	Pontic - porcelain fused to predominantly base metal
D6242	Pontic - porcelain fused to noble metal
D6243	Pontic - porcelain fused to titanium and titanium alloys
D6245	Pontic - porcelain/ceramic
D6250	Pontic - resin with high noble metal
D6251	Pontic - resin with predominantly base metal
D6252	Pontic - resin with noble metal
D6253	Provisional pontic - further treatment or completion of diagnosis necessary prior to final impression
D6254	Interim Pontic
D6545	Retainer - cast metal for resin bonded fixed prosthesis
D6548	Retainer - porcelain/ceramic for resin bonded fixed prosthesis
D6549	Retainer – for resin bonded fixed prosthesis
D6600	Retainer inlay - porcelain/ceramic, two surfaces
D6601	Retainer inlay - porcelain/ceramic, three or more surfaces
D6602	Retainer inlay - cast high noble metal, two surfaces
D6603	Retainer inlay - cast high noble metal, three or more surfaces
D6604	Retainer inlay - cast predominantly base metal, two surfaces
D6605	Retainer inlay - cast predominantly base metal, three or more surfaces
D6606	Retainer inlay - cast noble metal, two surfaces
D6607	Retainer inlay - cast noble metal, three or more surfaces
D6608	Retainer onlay - porcelain/ceramic, two surfaces
D6609	Retainer onlay - porcelain/ceramic, three or more surfaces
D6610	Retainer onlay - cast high noble metal, two surfaces
D6611	Retainer onlay - cast high noble metal, three or more surfaces
D6612	Retainer onlay - cast predominantly base metal, two surfaces
D6613	Retainer onlay - cast predominantly base metal, three or more surfaces
D6614	Retainer onlay - cast noble metal, two surfaces
D6615	Retainer onlay - cast noble metal, three or more surfaces
D6624	Retainer inlay - titanium
D6634	Retainer onlay - titanium
D6710	Retainer crown - indirect resin-based composite
D6720	Retainer crown - resin with high noble metal
D6721	Retainer crown - resin with predominantly base metal
D6722	Retainer crown - resin with noble metal
D6740	Retainer crown - porcelain/ceramic
D6750	Retainer crown - porcelain fused to high noble metal
D6751	Retainer crown - porcelain fused to predominantly base metal
D6752	Retainer crown - porcelain fused to noble metal
D6753	Retainer crown - porcelain fused to titanium and titanium alloys
D6780	Retainer crown - 3/4 cast high noble metal
D6781	Retainer crown - 3/4 cast predominantly base metal
D6782	Retainer crown - 3/4 cast noble metal
D6783	Retainer crown - 3/4 porcelain/ceramic
D6784	Retainer crown ¾ - titanium and titanium alloys
D6790	Retainer crown - full cast high noble metal
D6791	Retainer crown - full cast predominantly base metal
D6792	Retainer crown - full cast noble metal
D6793	Provisional retainer crown - further treatment or completion of diagnosis necessary prior to final impression
D6794	Retainer crown - titanium and titanium alloys
D6795	Interim Retainer Crown
D6920	Connector bar
D6930	Re-cement or re-bond fixed partial denture
D6940	Stress breaker
D6950	Precision attachment
D6970	Post and core in addition to fixed partial denture retainer, indirectly fabricated.
D6972	Prefabricated post and core in addition to fixed partial denture retainer.
D6973	Core build-up for retainer, including any pins.
D6975	Coping - Metal
D6976	Each additional indirectly fabricated post - same tooth
D6977	Each additional prefabricated post - same tooth
D6980	Fixed partial denture repair necessitated by restorative material failure
D6985	Pediatric partial denture, fixed
D6999	Unspecified fixed prosthodontic procedure, by report
D7111	Extraction, coronal remnants – primary tooth
D7140	Extraction, erupted tooth or exposed root (elevation and/or forceps removal)
D7210	Extraction, erupted tooth requiring removal of bone and/or sectioning of tooth, and including elevation of mucoperiosteal flap if indicated.
D7220	Removal of impacted tooth - soft tissue
D7230	Removal of impacted tooth - partially bony
D7240	Removal of impacted tooth - completely bony
D7241	Removal of impacted tooth - completely bony, with unusual surgical complications.
D7250	Removal of residual tooth roots (cutting procedure)
D7251	Coronectomy – intentional partial tooth removal, impacted teeth only
D7260	Oroantral fistula closure
D7261	Primary closure of a sinus perforation
D7270	Tooth re-implantation and/or stabilization of accidentally evulsed or displaced tooth
D7272	Tooth transplantation (includes re-implantation from one site to another and splinting and/or stabilization)
D7280	Exposure of an unerupted tooth
D7282	Mobilization of erupted or malpositioned tooth to aid eruption
D7283	Placement of device to facilitate eruption of impacted tooth.
D7285	Incisional biopsy of oral tissue-hard (bone, tooth)
D7286	Incisional biopsy of oral tissue-soft
D7287	Exfoliative cytological sample collection
D7288	Brush biopsy - transepithelial sample collection
D7290	Surgical repositioning of teeth
D7291	Transseptal fiberotomy/supra crestal fiberotomy, by report
D7292	Placement of temporary anchorage device [screw retained plate] requiring flap; includes device removal.
D7293	Placement of temporary anchorage device requiring flap; includes device removal
D7294	Placement of temporary anchorage device without flap
D7295	Harvest of bone for use in autogenous grafting procedure
D7296	Corticotomy – one to three teeth or tooth spaces, per quadrant
D7297	Corticotomy – four or more teeth or tooth spaces, per quadrant
D7298	Removal of temporary anchorage device [screw-retained plate], requiring flap.
D7299	Removal of temporary anchorage device, requiring flap.
D7300	Removal of temporary anchorage device without flap.
D7310	Alveoloplasty in conjunction with extractions - four or more teeth or tooth spaces, per quadrant
D7311	Alveoloplasty in conjunction with extractions - one to three teeth or tooth spaces, per quadrant
D7320	Alveoloplasty not in conjunction with extractions - four or more teeth or tooth spaces, per quadrant
D7321	Alveoloplasty not in conjunction with extractions - one to three teeth or tooth spaces, per quadrant
D7340	Vestibuloplasty - ridge extension (secondary epithelialization)
D7350	Vestibuloplasty - ridge extension (including soft tissue grafts, muscle reattachment, revision of soft tissue attachment, and management of hypertrophied and hyperplastic tissue)
D7410	Excision of benign lesion up to 1.25 cm
D7411	Excision of benign lesion greater than 1.25 cm.
D7412	Excision of benign lesion, complicated
D7413	Excision of malignant lesion up to 1.25 cm
D7414	Excision of Malignant Lesion Greater Than 1.25 cm
D7415	Excision of Malignant Lesion, Complicated
D7440	Excision of Malignant Tumor - Lesion Diameter Up to 1.25 cm
D7441	Excision of Malignant Tumor - Lesion Diameter Greater Than 1.25 cm
D7450	Removal of benign odontogenic cyst or tumor - Lesion diameter up to 1.25 cm
D7451	Removal of benign odontogenic cyst or tumor - Lesion diameter greater than 1.25 cm
D7460	Removal of benign nonodontogenic cyst or tumor - lesion diameter up to 1.25 cm.
D7461	Removal of benign nonodontogenic cyst or tumor - lesion diameter greater than 1.25 cm.
D7465	Destruction of lesion(s) by physical or chemical method, by report.
D7471	Removal of lateral exostosis (maxilla or mandible)
D7472	Removal of Torus Palatinus
D7473	Removal of Torus Mandibularis
D7485	Reduction of Osseous Tuberosity
D7490	Radical resection of maxilla or mandible
D7509	Marsupialization of Odontogenic Cyst
D7510	Incision and Drainage of Abscess - Intraoral Soft Tissue
D7511	Incision and drainage of abscess - intraoral soft tissue - complicated (includes drainage of multiple fascial spaces)
D7520	Incision and Drainage of Abscess - Extraoral Soft Tissue
D7521	Incision and drainage of abscess - extraoral soft tissue - complicated (includes drainage of multiple fascial spaces)
D7530	Removal of foreign body from mucosa, skin, or subcutaneous alveolar tissue.
D7540	Removal of reaction-producing foreign bodies, musculoskeletal system
D7550	Partial ostectomy/sequestrectomy for removal of non-vital bone
D7560	Maxillary sinusotomy for removal of tooth fragment or foreign body.
D7610	Maxilla - open reduction (teeth immobilized, if present)
D7620	Maxilla - closed reduction (teeth immobilized, if present)
D7630	Mandible open reduction (teeth immobilized, if present)
D7640	Mandible - closed reduction (teeth immobilized, if present)
D7650	Malar and/or zygomatic arch - open reduction
D7660	Malar and/or zygomatic arch - closed reduction
D7670	Alveolus - closed reduction and stabilization of teeth
D7671	Alveolus open reduction and stabilization, may include stabilization of teeth
D7680	Facial bones - complicated reduction with fixation and multiple surgical approaches
D7710	Maxilla - open reduction
D7720	Maxilla - Closed Reduction
D7730	Mandible - Open Reduction
D7740	Mandible - Closed Reduction
D7750	Malar and/or Zygomatic Arch - Open Reduction
D7760	Malar and/or Zygomatic Arch - Closed Reduction
D7770	Alveolus - Open Reduction and Stabilization of Teeth
D7771	Alveolus, Closed Reduction, Stabilization of Teeth
D7780	Facial bones - Complicated reduction with fixation and multiple approaches.
D7810	Open Reduction of Dislocation
D7820	Closed Reduction of Dislocation
D7830	Manipulation Under Anesthesia
D7840	Condylectomy
D7850	Surgical discectomy, with/without implant
D7852	Disc Repair
D7854	Synovectomy
D7856	Myotomy
D7858	Joint Reconstruction
D7860	Arthrotomy
D7865	Arthroplasty
D7870	Arthrocentesis
D7871	Non-Arthroscopic Lysis and Lavage
D7872	Arthroscopy - Diagnosis, with or without Biopsy
D7873	Arthroscopy: Lavage and Lysis of Adhesions
D7874	Arthroscopy: Disc Repositioning and Stabilization
D7875	Arthroscopy: Synovectomy
D7876	Arthroscopy: Discectomy
D7877	Arthroscopy: Debridement
D7880	Occlusal Orthotic Device, By Report
D7881	Occlusal Orthotic Device Adjustment
D7899	Unspecified TMD therapy, by report
D7910	Suture of recent small wounds up to 5 cm.
D7911	Complicated Suture - Up to 5 cm
D7912	Complicated Suture - Greater than 5 cm
D7920	Skin graft (identify defect covered, location, and type of graft)
D7921	Collection and application of autologous blood concentrate product
D7922	Placement of intra-socket biological dressing to aid in hemostasis or clot stabilization, per site.
D7940	Osteoplasty for Orthognathic Deformities
D7941	Osteotomy - Mandibular Rami
D7943	Osteotomy - Mandibular Rami with Bone Graft; Includes Obtaining the Graft
D7944	Osteotomy - Segmented or Subapical
D7945	Osteotomy - Body of Mandible
D7946	LeFort I (Maxilla - Total)
D7947	LeFort I (Maxilla - Segmented)
D7948	LeFort II or LeFort III (osteoplasty of facial bones for midface hypoplasia or retrusion) without bone graft
D7949	LeFort II or LeFort III - With Bone Graft
D7950	Osseous, osteoperiosteal, or cartilage graft of the mandible or maxilla - autogenous or non-autogenous, by report.
D7951	Sinus augmentation with bone or bone substitutes via a lateral open approach.
D7952	Sinus Augmentation via a Vertical Approach
D7953	Bone replacement graft for ridge preservation - per site
D7955	Repair of maxillofacial soft and/or hard tissue defect
D7956	Guided tissue regeneration, edentulous area – resorbable barrier, per site
D7957	Guided Tissue Regeneration, Edentulous Area – Non-Resorbable Barrier, Per Site
D7960	Frenulectomy – also known as frenectomy or frenotomy – separate procedure, not incidental to another procedure.
D7961	Buccal/Labial Frenectomy (Frenulectomy)
D7962	Lingual Frenectomy (Frenulectomy)
D7963	Frenuloplasty
D7970	Excision of Hyperplastic Tissue - Per Arch
D7971	Excision of Pericoronal Gingiva
D7972	Surgical Reduction of Fibrous Tuberosity
D7979	Non-surgical sialolithotomy
D7980	Surgical sialolithotomy
D7981	Excision of salivary gland, by report
D7982	Sialodochoplasty
D7983	Closure of salivary fistula
D7990	Emergency tracheotomy
D7991	Coronoidectomy - comprehensive guide & benefit
D7993	Surgical placement of craniofacial implant – extra oral
D7994	Surgical placement of zygomatic implant
D7995	Synthetic graft - mandible or facial bones, by report
D7996	Implant-mandible for augmentation purposes (excluding alveolar ridge), by report
D7997	Appliance removal (not by dentist who placed appliance), includes removal of archbar.
D7998	Intraoral placement of a fixation device not in conjunction with a fracture
D7999	Unspecified oral surgery procedure, by report
D8010	Limited orthodontic treatment of the primary dentition
D8020	Limited orthodontic treatment explained
D8030	Limited orthodontic treatment of the adolescent dentition
D8040	Limited orthodontic treatment of the adult dentition
D8050	Interceptive orthodontic treatment
D8060	Interceptive orthodontic treatment of the transitional dentition
D8070	Comprehensive orthodontic treatment of the transitional dentition
D8080	Comprehensive orthodontic treatment of the adolescent dentition
D8090	Comprehensive orthodontic treatment for adults
D8210	Understanding removable appliance therapy
D8220	Understanding fixed appliance therapy
D8660	Pre-orthodontic treatment examination to monitor growth and development.
D8670	Periodic orthodontic treatment visit
D8680	Orthodontic retention (removal of appliances, construction and placement of retainer(s))
D8681	Removable orthodontic retainer adjustment
D8690	Orthodontic treatment (alternative billing to a contract fee)
D8691	Repair of Orthodontic Appliance
D8692	Replacement of lost or broken retainer.
D8693	Rebonding or recementing and/or repair, as required, of fixed retainers.
D8695	Removal of fixed orthodontic appliances for reasons other than completion of treatment
D8696	Repair of orthodontic appliance – maxillary
D8697	Repair of orthodontic appliance – mandibular
D8698	Re-cement or re-bond fixed retainer - maxillary
D8699	Re-cement or re-bond fixed retainer – mandibular
D8701	Repair of fixed retainer, includes reattachment – maxillary
D8702	Repair of fixed retainer, includes reattachment – mandibular
D8703	Replacement of lost or broken retainer - maxillary
D8704	Replacement of lost or broken mandibular retainer
D8999	Unspecified orthodontic procedure, by report
D9110	Palliative (emergency) treatment of dental pain - minor procedure
D9120	Fixed partial denture sectioning
D9130	Temporomandibular joint dysfunction – non-invasive physical therapies
D9210	Local anesthesia not in conjunction with operative or surgical procedures
D9211	Regional block anesthesia
D9212	Trigeminal division block anesthesia
D9215	Local anesthesia for dental procedures
D9219	Evaluation for sedation or anesthesia
D9220	Deep Sedation/General Anesthesia - First 30 Minutes
D9221	Deep Sedation/General Anesthesia - Each Additional 15 Minutes
D9222	Deep sedation/general anesthesia – first 15 minutes
D9223	Deep sedation/general anesthesia – each subsequent 15 minute increment
D9230	Inhalation of nitrous oxide for dental anxiety
D9239	Intravenous moderate (conscious) sedation/analgesia - first 15 minutes
D9241	Intravenous Conscious Sedation/Analgesia - First 30 Minutes
D9242	Intravenous Conscious Sedation/Analgesia - Each Additional 15 Minutes
D9243	Intravenous moderate sedation/analgesia – each subsequent 15-minute increment
D9248	Non-intravenous conscious sedation
D9310	Consultation - diagnostic service provided by dentist or physician other than requesting dentist or physician
D9311	Consultation with a medical professional
D9410	House/extended care facility call - procedure
D9420	Hospital or ambulatory surgical center call
D9430	Office visit for observation - explanation
D9440	Office visit after regularly scheduled hours
D9450	Case presentation, subsequent to detailed and extensive treatment planning.
D9610	Therapeutic parenteral drug, single administration
D9612	Therapeutic parenteral drugs, two or more administrations, different medications
D9613	Infiltration of sustained release therapeutic drug, per quadrant
D9630	Drugs or medicaments dispensed in the office for home use.
D9910	Application of desensitizing medicament
D9911	Application of desensitizing resin for cervical and/or root surface, per tooth
D9912	Pre-visit patient screening
D9920	Behavior management, by report
D9930	Treatment of complications (post-surgical) - unusual circumstances, by report
D9932	Cleaning and inspection of removable complete denture, maxillary
D9933	Cleaning and inspection of removable complete denture, mandibular
D9934	Cleaning and inspection of removable partial denture, maxillary
D9935	Cleaning and inspection of removable partial denture, mandibular
D9940	Occlusal Guard, By Report
D9941	Fabrication of athletic mouthguard
D9942	Repair and/or reline of occlusal guard
D9943	Occlusal guard adjustment explained
D9944	Occlusal guard – hard appliance, full arch
D9945	Occlusal guard – soft appliance, full arch
D9946	Occlusal guard – hard appliance, partial arch
D9947	Custom sleep apnea appliance fabrication and placement.
D9948	Adjustment of Custom Sleep Apnea Appliance
D9949	Repair of Custom Sleep Apnea Appliance
D9950	Occlusion analysis - mounted case
D9951	Occlusal adjustment - limited
D9952	Occlusal adjustment - complete
D9953	Reline Custom Sleep Apnea Appliance (Indirect)
D9961	Duplicate/copy patient's records
D9970	Enamel microabrasion
D9971	Odontoplasty - per tooth
D9972	External bleaching - per arch - performed in office
D9973	External bleaching - per tooth
D9974	Internal bleaching - per tooth
D9975	External bleaching for home application, per arch; includes materials and fabrication of custom trays.
D9985	Sales tax
D9986	Missed appointment
D9987	Cancelled appointment
D9990	Certified translation or sign-language services – per visit
D9991	Dental case management - addressing appointment compliance barriers
D9992	Dental case management - care coordination
D9993	Dental case management - motivational interviewing
D9994	Dental case management - patient education to improve oral health literacy
D9995	Teledentistry – synchronous, real-time encounter
D9996	Teledentistry – asynchronous; information stored and forwarded to dentist for subsequent review
D9997	Dental case management - patients with special health care needs
D9998	Patient no-show or cancellation without 24-hour notice
D9999	Unspecified adjunctive procedure, by report

#### EXTREMELY IMPORTANT TO NEVER LEAVE OUT ANY INFORMATION FOR PROCEDURE CODES LISTED ABOVE, PROCEDURE CODES MAY SOMETIMES BE MENTIONED AS A DESCRIPTION OF A PROCEDURE. 
"""
