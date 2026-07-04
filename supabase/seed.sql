-- Demo seed
insert into presets (id, name, category, stack, downloads, is_pro) values
(gen_random_uuid(),'Cinematic Teal-Orange','cinematic','[{"type":"CURVES"},{"type":"SPLIT_TONE"}]',1240,false),
(gen_random_uuid(),'Portra 400','film','[{"type":"FADE"},{"type":"GRAIN"}]',980,false),
(gen_random_uuid(),'AI Portrait Pop','portrait','[{"type":"FACE_RESTORE"},{"type":"CLARITY"}]',542,true),
(gen_random_uuid(),'Clean Product','product','[{"type":"WHITES"},{"type":"SHARPEN"}]',310,false),
(gen_random_uuid(),'Astro Denoise Pro','astro','[{"type":"AI_DENOISE"},{"type":"CONTRAST"}]',210,true);
