db.malePeople.find().forEach(function(p){
	if(p.nSon>0)p.hasSon=1;
	else {
		p.hasSon=0;
		p.firth_birth=p.age+1;
	}

	//marriage
	if(p.w1id >0 || p.w2id >0){
		p.hasMarriaged=1;
	}else{
		p.hasMarriaged=0;
	}

	db.malePeople.save(p);
})