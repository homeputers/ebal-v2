package com.homeputers.ebal2.api.mybatis.typehandler;

import com.homeputers.ebal2.api.domain.group.Group;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.UUID;

@MappedTypes(Group.class)
public class GroupTypeHandler extends BaseTypeHandler<Group> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Group parameter, JdbcType jdbcType) throws SQLException {
        // We don't need to do anything here since we're not using this type handler for parameters
        // The Group object properties are extracted and set individually in the mapper XML
        if (parameter != null && parameter.id() != null) {
            ps.setObject(i, parameter.id().toString());
        } else {
            ps.setNull(i, java.sql.Types.VARCHAR);
        }
    }

    @Override
    public Group getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return createGroupFromResultSet(rs);
    }

    @Override
    public Group getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return createGroupFromResultSet(rs);
    }

    @Override
    public Group getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        throw new UnsupportedOperationException("Getting Group from CallableStatement is not supported");
    }

    private Group createGroupFromResultSet(ResultSet rs) throws SQLException {
        UUID id = UUID.fromString(rs.getString("id"));
        String name = rs.getString("name");
        return new Group(id, name, new HashSet<>());
    }
}
