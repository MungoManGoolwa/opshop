--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: buyback_offers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.buyback_offers (id, user_id, item_title, item_description, item_condition, item_age, item_brand, item_category, images, ai_evaluated_retail_price, buyback_offer_price, ai_evaluation_data, status, expires_at, accepted_at, created_at, admin_notes, reviewed_by, reviewed_at, email_sent, email_sent_at) FROM stdin;
1	45576476	iphone 12	not locked, no cracks, fair conditions, battery life ok	good	2-5-years	Apple	electronics	{}	450.00	225.00	{"category": "Smartphones - Premium Legacy", "reasoning": "iPhone 12 (64GB base model assumed) launched at $1349 AUD in 2020. After 3-4 years, considering 'fair condition' with 'ok' battery life, significant depreciation applies. Apple devices retain value well but show steep decline after 3+ years. Current market shows similar condition units selling $400-500 range. Battery concerns and fair condition suggest lower end of range.", "brandValue": "high - Apple maintains strong brand recognition and ecosystem loyalty in Australia, ensuring consistent demand even for older models. iOS updates and build quality support resale value retention better than Android equivalents.", "confidence": 0.85, "depreciation": 0.67, "marketDemand": "medium - iPhone 12 still relevant for basic users but newer models dominate premium segment. Decent demand from budget-conscious buyers and first-time iPhone users, but limited by battery concerns and fair condition rating.", "marketFactors": ["Strong iPhone 13/14/15 availability reducing iPhone 12 demand", "Australian preference for newer models with carrier deals", "High supply of iPhone 12 units in second-hand market", "Battery degradation concerns affecting buyer confidence", "Competition from refurbished units with warranties"], "buybackOfferPrice": 225, "conditionAssessment": "Fair condition with 'ok' battery life suggests moderate wear, potential charging issues, and cosmetic imperfections. No cracks is positive but overall condition limits premium pricing. Battery health likely 80-85% affecting usability.", "estimatedRetailPrice": 450, "suggestedListingPrice": 450}	approved	2025-07-27 23:18:25.779	\N	2025-07-26 23:18:25.91317		45576476	2025-07-26 23:34:04.321	f	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, slug, description, parent_id, is_active, created_at) FROM stdin;
1	New Arrivals	new-arrivals	Latest items added to the marketplace	\N	t	2025-07-26 19:14:54.778774
2	Fashion	fashion	Clothing, shoes, and accessories	\N	t	2025-07-26 19:14:54.778774
3	Electronics	electronics	Phones, computers, and gadgets	\N	t	2025-07-26 19:14:54.778774
4	Home & Garden	home-garden	Furniture, decor, and garden items	\N	t	2025-07-26 19:14:54.778774
5	Books & Media	books-media	Books, DVDs, games, and more	\N	t	2025-07-26 19:14:54.778774
6	Sports & Outdoors	sports-outdoors	Exercise equipment and outdoor gear	\N	t	2025-07-26 19:14:54.778774
7	Kids & Baby	kids-baby	Toys, clothes, and baby items	\N	t	2025-07-26 19:14:54.778774
8	Vehicles	vehicles	Cars, bikes, and automotive	\N	t	2025-07-26 19:14:54.778774
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, location, phone, is_verified, created_at, updated_at, account_type, shop_upgrade_date, shop_expiry_date, max_listings, stripe_customer_id, stripe_subscription_id, address, city, state, postcode, country, bio, business_name, abn, is_active, store_credit) FROM stdin;
sample-user-1	seller1@example.com	Alice	Johnson	\N	seller	Sydney, NSW	\N	t	2025-07-26 19:15:09.209495	2025-07-26 19:15:09.209495	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
sample-user-2	seller2@example.com	Bob	Smith	\N	seller	Melbourne, VIC	\N	t	2025-07-26 19:15:09.209495	2025-07-26 19:15:09.209495	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
sample-user-3	seller3@example.com	Carol	Davis	\N	seller	Brisbane, QLD	\N	f	2025-07-26 19:15:09.209495	2025-07-26 19:15:09.209495	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
sample-user-4	seller4@example.com	David	Wilson	\N	business	Perth, WA	\N	t	2025-07-26 19:15:09.209495	2025-07-26 19:15:09.209495	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
sample-user-5	seller5@example.com	Emma	Brown	\N	seller	Adelaide, SA	\N	t	2025-07-26 19:15:09.209495	2025-07-26 19:15:09.209495	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
44555385	brendan.r.faulds@gmail.com	Brendan	Faulds	\N	customer	\N	\N	f	2025-07-26 20:54:29.085943	2025-07-26 20:54:29.085943	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
45576476	bfaulds@mac.com	Brendan	Faulds	\N	admin	\N	\N	f	2025-07-26 20:40:50.852397	2025-07-26 22:46:16.58	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
test-user-1	test@opshop.com	Test	User	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face	admin	\N	\N	t	2025-07-26 21:12:43.988882	2025-07-26 22:18:18.774	seller	\N	\N	10	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
demo-admin-1	demo@opshop.com	Demo	Admin	\N	admin	\N	\N	t	2025-07-26 22:33:12.924584	2025-07-26 22:33:12.924584	business	\N	\N	1000	\N	\N	\N	\N	\N	\N	Australia	\N	\N	\N	t	0.00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, title, description, price, original_price, condition, status, category_id, seller_id, brand, size, color, material, images, location, shipping_cost, is_verified, views, likes, created_at, updated_at, is_buyback_item) FROM stdin;
8	Vintage Denim Jeans	High-waisted vintage jeans from the 90s. Perfect fit and great condition.	45.00	90.00	good	available	2	sample-user-3	Levi's	30	Blue	Denim	{https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300}	Brisbane, QLD	12.00	f	34	8	2025-07-26 19:15:39.386297	2025-07-26 19:15:39.386297	f
7	iPhone 12 Pro	Unlocked iPhone 12 Pro in space gray. Minor wear but fully functional.	850.00	1200.00	good	available	3	sample-user-2	Apple	128GB	Space Gray	Glass/Aluminum	{https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300}	Melbourne, VIC	20.00	t	79	23	2025-07-26 19:15:39.386297	2025-07-26 19:15:39.386297	f
10	Designer Handbag	Authentic designer handbag in pristine condition. Comes with authenticity certificate.	280.00	450.00	excellent	available	2	sample-user-5	Coach	Medium	Black	Leather	{https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300}	Adelaide, SA	18.00	t	89	25	2025-07-26 19:15:39.386297	2025-07-26 19:15:39.386297	f
6	Vintage Leather Jacket	Classic brown leather jacket in excellent condition. Perfect for autumn weather.	120.00	300.00	excellent	available	2	sample-user-1	Zara	M	Brown	Leather	{https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300}	Sydney, NSW	15.00	t	47	12	2025-07-26 19:15:39.386297	2025-07-26 19:15:39.386297	f
9	MacBook Air M1	2020 MacBook Air with M1 chip. Excellent performance for work and study.	1200.00	1599.00	excellent	available	3	sample-user-4	Apple	13-inch	Silver	Aluminum	{https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300}	Perth, WA	25.00	t	159	42	2025-07-26 19:15:39.386297	2025-07-26 19:15:39.386297	f
11	iphone 12	iphone 12 standard in fairly good condition - no crack or scrapes - is unlocked	200.00	200.00	good	available	3	45576476	apple				{}	goolwa	10.00	f	1	0	2025-07-26 23:16:32.704141	2025-07-26 23:16:32.704141	f
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, order_id, buyer_id, seller_id, product_id, total_amount, shipping_cost, payment_gateway, payment_intent_id, payment_status, order_status, shipping_address, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: commissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.commissions (id, product_id, seller_id, sale_price, commission_rate, commission_amount, status, created_at, order_id, seller_amount) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, sender_id, receiver_id, product_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: payment_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_settings (id, stripe_enabled, paypal_enabled, default_commission_rate, processing_fee_rate, currency, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, order_id, reviewer_id, reviewee_id, product_id, rating, title, comment, review_type, is_verified, helpful_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
EQ0O-DZ6KVCL-_Q7UgmMmXrMr3FxC_Lh	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:39:20.159Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:39:21
LiyePtbuvbddTBLQ51FIkKfWIOkHGszk	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169410}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:16:50.960Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:16:52
tDLB5EK_zPkBgrlA6OkdVsftp-6Z4x83	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:49:58.343Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:49:59
IB-Wr_izctiDillajAYhLtrAFniuX3-I	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:52:38.110Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:52:39
VdrCOFo4YbN-ASyScRsuzTGgs_YSQJZR	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:32:15.239Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:32:16
BfzTH_Rv8mRl9TYIPZrdpqD0qcY6SFn4	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169488}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:18:08.443Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:18:09
8Zf4TpX2qo84KcD5NgZwOmIjfmJ1XnZA	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:46:03.294Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:46:04
6fHa1miVXO7gSJwzqm1j4WUYRY40SXyB	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:32:09.868Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:32:10
Kd_vcgyA1oxY8UAcFoA5MSXwK9iG5Sn3	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:36:00.784Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:36:01
IwqO7-UI3Now2nOCyyrDvtdfFU7pmOTE	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169283}, "cookie": {"path": "/", "secure": true, "expires": "2025-08-02T21:14:43.534Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "depMNJIIQ2btt1zgmjL3LPjVPhZiU2J1U7e2egaZrmE"}}	2025-08-02 21:19:11
LqRCKYOudSbUox_jOSsAhs3FnuPPzcAI	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169564}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:19:24.931Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:19:27
mpXya_cNgjqB0oD2VTQLSuebA40GnNcM	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169611}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:20:11.731Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:25:54
uvtD_qoSlXUe4AmOg0rfO-NKzAkJNNy_	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169396}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:16:36.780Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:16:37
MSwFbx0y65s0fsVVtqkQTKSN208W_qLI	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169403}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:16:43.453Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:16:44
M4wEH4NCkA9-caX3wrD9Sx8ASTDLst_E	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-02T20:54:29.151Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "44b6d545-f2f1-4337-b1ae-44bf28de7018", "exp": 1753566868, "iat": 1753563268, "iss": "https://replit.com/oidc", "sub": "44555385", "email": "brendan.r.faulds@gmail.com", "at_hash": "FX-Zce_fxSVxbHTdH0M20Q", "username": "brendanrfaulds", "auth_time": 1753563268, "last_name": "Faulds", "first_name": "Brendan"}, "expires_at": 1753566868, "access_token": "yNU3Pn7CzqsQUREqXdWzbDwOLJC9uSbBElDOa-9SHKE", "refresh_token": "46X-jcXZ7sX4ZLWAHkHgFeoD0J8dB82mfSOfvPWztZr"}}}	2025-08-02 20:54:31
KEsAeijE1wb4A68XX-2yw81hjEqv6eP9	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754170035}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:27:15.445Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:27:16
nJBcPQG3jtFSYQypjXYJpi3Enh3IK9qt	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:27:44.797Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:27:45
ciA-7BwjvOlammEwGZftfDt1u8w7D2yN	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169456}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:17:36.913Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:17:38
ySAnVWJrMOB0r8K4gzOp_V34joBrEvB1	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-02T21:06:01.739Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "25YuEQC5aCdnxYXj_J0H8m3fnYGBYVRtgTZm6C24XlA"}}	2025-08-02 21:06:02
Ds0vltjKlKbM-e6o6-eq8jPikLkpel3T	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-02T21:06:02.527Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "7jURH6tChP8qqg826_rOfh-PaWjGYs35fwM8feWMc48"}}	2025-08-02 21:06:03
IbSjpUCSTRD1lUkdPw23x4OX5xN4Joc7	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169615}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:20:15.953Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:20:16
xksGJ741hkwLMS5-RBdYNN75gxrMCLtz	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:50:06.937Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:50:07
saBS4g99bR_VB1Z16Df3NTSSU5Sv1g2O	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169647}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:20:47.846Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:20:49
w2kiC98lbZyuF-FLkDlbbWVeK77z3tD0	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:20:51.287Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:20:52
zXPy8wvQeTTNais4p1pYtWVdJli23rLj	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169679}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:21:19.115Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:21:21
JBhihlLlwlxTUefS7dp3RWBGNIbb9UOq	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:35:33.182Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:35:34
CC7WdV-0HoY51GZZXwpeahlwXyQsXX4U	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:22:36.728Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:22:37
7m6b2o3BOTKeoUi4oEG1Pqu4ToZ4GLUl	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:44:37.725Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:44:38
8y1sHUgtPLQ6MN3eEWY98GX8TtFoqci5	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169319}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:15:19.033Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-08-02 21:28:15
ukfbmKATjfRvq63ldMEVJb2-KiQBjG3s	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:52:52.051Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:52:53
SlJAFMkP5MFUCF9qlyhe7D2eSd6QAO_m	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:44:45.749Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:44:46
5pPJwTeEvr8dAdeS3Wn4c7mchbKZkhMB	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:01:36.882Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 23:01:37
aXymg5TbUmxm2GR1rC6fhvQonRRqwcnw	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:42:32.175Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:42:33
jFNQLqJRbI2U5IFVZcU-jGPtT37uhnMX	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:04:32.437Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604799999}}	2025-08-02 22:04:33
HCdTK592ajJKiZ17EOVbEQ69TX-RfAya	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-02T21:29:12.162Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "HSwHfNm3vlQguUJM6eBicehAaHmub_ExRQnaYpr1a68"}}	2025-08-02 21:29:13
DiIyNTkLNOBMbRjudSuZg-StW-5kOdNB	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:06:01.139Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:06:02
9oJdqJbxmb7j-0chRkZiCrIOVWlh7DgH	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:39:23.181Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:39:24
bJF9IFSLewTjzUnwZScoRjOImmrod_Qi	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T23:06:30.788Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 23:06:31
yUijxqFzRHjAqBN4qGszmn0UEFrrJFvE	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T23:17:24.827Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 23:17:25
uYtE-msPE785645jDNojSkw3sFF4zZe-	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:32:17.543Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:32:18
E1dBRdrwYFTP7wQT9HbSp8D8IKtZ3qhr	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:10:03.516Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:10:04
aB7FblQTbjX5HWO1TQffwyCVo1cLfSab	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:46:45.650Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:46:46
yGZxdmeZKnrq6WocZxwGRr9xP_JjrRW_	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:49:11.900Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:49:12
bl1fo3XVJ4xokx8daUajyLrFfr2xROCM	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:33:52.237Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:33:53
CKxyXvcY1FkReidg0UZg-xPq0cMcU0C_	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:17:44.930Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:17:45
ocPVUL7E0-r2oaOOyYDMGBIDLoqn39YE	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T23:32:09.464Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604799995}}	2025-08-02 23:32:10
SyMayo03fBVfO6IiJikdUEd648fMP77d	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:39:23.185Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:39:24
OIkEQ4DMdbmRH64UjRHDJfKbMFxI5fLG	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754170041}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:27:21.705Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:27:24
uP3XfcrxAmDbq5vB2oMxeePLOF4Kot96	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:44:43.395Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:44:44
V3xQ0CK3x62Gabo1nXcAzW2xtP5fOYEF	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:02:17.825Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 23:02:18
n3X1e5_nvJ0IUbPQS92uOs_h9l35ta_8	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754171205}, "cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:50:19.404Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:50:20
17JmHB9dqS74Tbj3BxlnCO134ev2XfZP	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754169164}, "cookie": {"path": "/", "secure": true, "expires": "2025-08-02T21:12:44.011Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "44b6d545-f2f1-4337-b1ae-44bf28de7018", "exp": 1753566050, "iat": 1753562450, "iss": "https://replit.com/oidc", "sub": "45576476", "email": "bfaulds@mac.com", "at_hash": "sgUW_Xf7CbjjyjTLjWeWkA", "username": "bfaulds", "auth_time": 1753562450, "last_name": null, "first_name": null}, "expires_at": 1753566050, "access_token": "fFh_YAvsIe4QjRI7f7njmL9TAdzTcFoq5E820TpQuQe", "refresh_token": "34wwcdajuF6MmxllrZZ2Mj6yokcB3MYmSJgH393iH8c"}}}	2025-08-02 21:29:36
qHiNqMoj5m_uQsmGCrPUKHyYHvIlADHK	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:32:17.232Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:32:18
PQp-PqVgtmHZA3y7ZlBUvE64Eresp5np	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:53:32.773Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:53:33
OyU2yOe9VKcrUlAZ8JGbpInEqpi_cal8	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:41:03.006Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:41:04
-l3gWfnflyYC0Oxa3dm4UyZe8qSLNapU	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:02:18.157Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 23:02:19
yJpAS3bZ1y8_KqO23MOwSpjgNvZ2XEQF	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:56:05.499Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:56:06
vvmtIN5jbKIqPVwzPwkI4SBr_CPo2j4w	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:50:07.658Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:50:08
Vxjp41-zoPwE0RZcL9aAkrBfhMTzAgFA	{"user": {"claims": {"sub": "test-user-1", "email": "test@opshop.com", "last_name": "User", "first_name": "Test", "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}, "expires_at": 1754170435}, "cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:33:56.887Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:33:57
qvdabopo7Ui1L4ZiECkwFRy_zb7aOkBO	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:43:45.465Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:43:46
_IyWj965uWslJqUMhZCf2ZiC42PU0Fsq	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:43:51.515Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:43:52
oq5icYacXRtLKEmF7pnFG5LINMahjMcn	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:21:38.674Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 23:21:39
e5Iz7iq4SA8MkRPHgtQd980qBwuoCiQA	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:46:49.434Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:46:50
1JejoML260SCARbJJ925i_h9KWdV6lgc	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:39:14.826Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "5b155aad-dc39-4393-bd39-8eb321d6890f", "exp": 1753573152, "iat": 1753569552, "iss": "https://replit.com/oidc", "sub": "45576476", "email": "bfaulds@mac.com", "at_hash": "GXlExBBu3i6HMM0HmgM3cA", "username": "bfaulds", "auth_time": 1753569551, "last_name": "Faulds", "first_name": "Brendan"}, "expires_at": 1753573152, "access_token": "s11RRjtkhb4cJxhx8jrJo__LnzNJhuBaaOQOAY4nXoE", "refresh_token": "I0T9lXWMbKWv4y7LDr0zIMegNuYKuwjTVz59LEjDEN3"}}}	2025-08-02 22:39:15
enMTPuoe3BJZq2bTRvOm8NJXWSHs4ous	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:49:37.568Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:49:38
03KkmJ9mbXrnL0zzF_U7v_z_U5V7rHlM	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:38:29.408Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 23:38:30
BvkSKF3S1zgtyyy6zgETT0HtuGZ35ljr	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:43:38.587Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:43:39
hPZuGTEGDJApSU2RsUTu4IUSz2RZmnhT	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:43:41.701Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:43:42
wjUmZDVy-EcQ0Kb-gBQXQK-AnCSnWEXz	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T21:50:19.098Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 21:50:20
m5Hg4iramPNBZt3NfyqIq2X5LTKFoLcN	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:14:32.641Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:14:33
VVcjHcpJpwEf8Uk8TyQwUyPz2jQJt0rh	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:53:58.960Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:53:59
JY22Oy4jg6O_fLnW4vY03v_9gu9snWlF	{"cookie": {"path": "/", "domain": ".opshop.online", "secure": true, "expires": "2025-08-02T22:39:44.252Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}}	2025-08-02 22:39:45
Znym5qHB0vjrCnkYucotuFH3g5TCNIWT	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:27:46.626Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:27:47
g_DdhqEkJNfGYR_lMn7pmmnoCWY-xR1B	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T22:44:43.398Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 22:44:44
t-pzR-gLbaHR0VMyj63dpoArGaEPrtt-	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T21:29:28.000Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 21:29:28
jGQb93pdL4NAiF2XvypMDBe70RHVHdXV	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:02:29.413Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-08-02 23:02:30
tKJID91tA3uxT4oRnvwXSaiReRUicOmr	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T23:36:07.397Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "b663cd38-30ce-4896-a322-10063db528ad", "exp": 1753573576, "iat": 1753569976, "iss": "https://replit.com/oidc", "sub": "45576476", "email": "bfaulds@mac.com", "at_hash": "mbq0DorGAymR2j7UbO4rEg", "username": "bfaulds", "auth_time": 1753569976, "last_name": "Faulds", "first_name": "Brendan"}, "expires_at": 1753573576, "access_token": "Rzp4qZ0_OnLqDQmEQ0hIVZVXEPR3c5sKViyTEH07Arz", "refresh_token": "a84klSyNezNSzyhFGvBQI5zkjXfbUgVjXEerCa6kM51"}}}	2025-08-02 23:36:08
\.


--
-- Data for Name: store_credit_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.store_credit_transactions (id, user_id, type, amount, description, reference_id, reference_type, balance_before, balance_after, created_at) FROM stdin;
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wishlists (id, user_id, product_id, created_at) FROM stdin;
1	45576476	9	2025-07-26 22:28:10.062213
\.


--
-- Name: buyback_offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.buyback_offers_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 10, true);


--
-- Name: commissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.commissions_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: payment_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payment_settings_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 11, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: store_credit_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.store_credit_transactions_id_seq', 1, false);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

