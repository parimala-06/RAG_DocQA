# Test questions for your RAG Doc QA app

## 1_Nimbus_Annual_Report_FY2025.pdf
- What was Nimbus's total revenue in FY2025? -> USD 68.5 million (27% growth)
- Which quarter had the highest revenue and why? -> Q4, USD 22.3M, NimbusFlow launch
- Who is the CFO? -> Anita Deshmukh
- How many employees work in Pune? -> 310 (table)
- What share of revenue is Consulting? -> 15% (also in pie chart image)

## 2_AquaPure_X200_Manual.pdf
- How often should the filter be replaced? -> every 9 months or on code F-04
- What does error E-07 mean? -> pump blocked, contact support
- What is the warranty period? -> 24 months
- What is the replacement cartridge model? -> AP-FC200

## 3_ClimateNet_Lite_Paper.pdf
- What accuracy did ClimateNet-Lite reach? -> 88.4%
- What dataset was used? -> SkyScan-50K (50,000 images)
- What was the inference time? -> 9 ms on a T4 GPU
- Who wrote the paper? -> Dr. Kavya Raman and Prof. Liam O'Connor

## Cross-document / edge cases
- Which document mentions a 24-month period? (should pick AquaPure only)
- Ask something not in any file, e.g. "Who is Nimbus's CEO?" -> should say it doesn't know (tests hallucination handling)
- Ask "What does Figure 4 show?" -> only the caption/nearby text is extractable, not chart pixels, unless your app does image captioning/OCR
