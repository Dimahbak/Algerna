-- 028: Suppression des exemples entre parenthèses dans les libellés de catégories
UPDATE categorie_signal SET libelle = 'Dépôt sauvage', libelle_ar = 'مخلفات عشوائية' WHERE id = 1;
UPDATE categorie_signal SET libelle = 'Chaussée dégradée', libelle_ar = 'طريق متضرر' WHERE id = 5;
UPDATE categorie_signal SET libelle = 'Décharge sauvage', libelle_ar = 'مفرغة عشوائية' WHERE id = 17;
UPDATE categorie_signal SET libelle = 'Mobilier urbain dégradé', libelle_ar = 'تجهيز حضري متضرر' WHERE id = 19;
UPDATE categorie_signal SET libelle = 'Câble électrique apparent', libelle_ar = 'سلك كهربائي ظاهر' WHERE id = 25;
UPDATE categorie_signal SET libelle = 'Bâtiment dégradé', libelle_ar = 'مبنى متضرر' WHERE id = 41;
UPDATE categorie_signal SET libelle = 'Équipement défectueux', libelle_ar = 'تجهيزات معطلة' WHERE id = 43;
UPDATE categorie_signal SET libelle = 'Bruit excessif', libelle_ar = 'ضوضاء مفرطة' WHERE id = 45;
UPDATE categorie_signal SET libelle = 'Nuisibles', libelle_ar = 'قوارض وحشرات' WHERE id = 47;
UPDATE categorie_signal SET libelle = 'Déversement illicite', libelle_ar = 'تفريغ غير قانوني' WHERE id = 57;
UPDATE categorie_signal SET libelle = 'Nid d''insectes dangereux', libelle_ar = 'عش حشرات خطيرة' WHERE id = 67;
