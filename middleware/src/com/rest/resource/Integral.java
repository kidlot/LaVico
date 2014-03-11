package com.rest.resource;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import java.util.*;
import java.sql.*;
import javax.sql.*;
import java.io.*;
import oracle.jdbc.driver.*;
import javax.naming.*;

import org.json.*;

import com.rest.TestBean;

@Path("integral")
public class Integral {

	@Path("getText")
    @GET
    @Produces("text/plain")
    public String getText() {
        return "hello lucky";
    }

	@Path("getXml")
	@GET
	@Produces(value=MediaType.APPLICATION_XML)
    public TestBean getXml(){
    	return new TestBean("a", 26, 62);
    }
	
	@Path("getJson")
	@GET
	@Produces(value=MediaType.APPLICATION_JSON)
    public TestBean getJson(@Context HttpServletRequest request) throws JSONException{
		
		JSONObject jsonObj = new JSONObject(request.getParameter("abc"));
		
		System.out.println("request:" + jsonObj.get("a"));
    	return new TestBean("a", 26, 62);
    }
	
	@Path("apply")
	@GET
	@Produces(value=MediaType.APPLICATION_JSON)
    public TestBean apply(@Context HttpServletRequest request) throws JSONException{
		
		String driver = "oracle.jdbc.driver.OracleDriver";
	    String strUrl = "jdbc:oracle:thin:@localhost:1521:hldrp301";
	    Statement stmt = null;
	    ResultSet rs = null;
	    Connection conn = null;
	    CallableStatement cstmt = null;
		
		try {
			Class.forName(driver);
			conn = DriverManager.getConnection(strUrl, "wintest", "testpound");
			conn.setAutoCommit(false);
			stmt = conn.createStatement();
		    ResultSet rset = stmt.executeQuery("select * from PUB_MEMBER_APPLY");
		    while (rset.next()) {
		         System.out.println (rset.getString(1));  
		    }
//		    stmt.close();
//		    conn.close();
//		    System.out.println ("Ok.");  
		    
			CallableStatement proc = null;
			proc = conn.prepareCall("{call PRO_MEMBER_APPLYCHECK(?,?,?,?)}");
			proc.setInt(1, 9076379);
			proc.setString(2, "wwww");
			proc.registerOutParameter(3, Types.VARCHAR);
			proc.registerOutParameter(4, Types.VARCHAR);
			proc.execute();
			String testPrint3 = proc.getString(3);
			System.out.println(testPrint3);
			String testPrint4 = proc.getString(4);
			System.out.println(testPrint4);

		    stmt.close();
		    conn.close();
		} catch (SQLException ex2) {
			ex2.printStackTrace();
		} catch (Exception ex2) {
			ex2.printStackTrace();
		}
		
		
		JSONObject jsonObj = new JSONObject(request.getParameter("abc"));
		
		System.out.println("request:" + jsonObj.get("a"));
    	return new TestBean("a", 26, 62);
		
    }
	
}