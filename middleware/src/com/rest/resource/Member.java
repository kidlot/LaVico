package com.rest.resource;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import com.rest.lib.DB;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Types;
import java.util.HashMap;

@Path("member")
public class Member {

	@Path("apply")
	@GET
	@Produces(value=MediaType.APPLICATION_JSON)
    public HashMap apply(@Context HttpServletRequest request){
		
		Connection conn = DB.getInstance().conn();
		
		HashMap rsMap = new HashMap();
		
		try {
		    
			CallableStatement proc = null;
			proc = conn.prepareCall("{call PRO_MEMBER_WCAPPLYCHECK(?,?,?,?)}");
			proc.setInt(1, 9076379);
			proc.setString(2, "wwww");
			proc.registerOutParameter(3, Types.VARCHAR);
			proc.registerOutParameter(4, Types.VARCHAR);
			proc.execute();

			rsMap.put("O_ISSUCCEED", proc.getString(3));
			rsMap.put("O_HINT", proc.getString(4));
			
			conn.close();
		}catch (Exception ex2) {
			ex2.printStackTrace();
		}
		
		
    	return rsMap;
		
    }
	
}