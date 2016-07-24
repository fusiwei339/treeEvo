db.trees_complex.find().forEach(function(d){
	var doc=db.malePeople.findOne({personid:d.personid});
	d.lastage=doc.lastage;
	d.birthyear=doc.birthyear;
	d.f_bir_age=doc.f_bir_age;
	d.l_bir_age=doc.l_bir_age;
	d.sonCountFix=doc.sonCountFix;
	db.trees_complex.save(d);
})