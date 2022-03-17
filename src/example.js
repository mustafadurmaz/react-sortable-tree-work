import React, { useCallback, Component, useReducer } from "react";
// import FileExplorerTheme from "react-sortable-tree-theme-minimal";
import SortableTree, {
  changeNodeAtPath,
  removeNodeAtPath,
  addNodeUnderParent,
} from "react-sortable-tree";
import { useForm } from "react-hook-form";
// This only needs to be done once; probably during your application's bootstrapping process.
import "bootstrap/dist/css/bootstrap.min.css";
import "react-sortable-tree/style.css";
// import NodeRendererCustom from "./node-content-renderer-custom";

const defaultState = {
  currentEditingNode: null,
  treeData: [
    {
      title: "Home",
      href: "",
      isDisabled: true,
    },
    {
      title: "Tijdschiften",
      href: "/",
    },
    {
      title: "NDFR Delen",
      href: undefined,
      expanded: true,
      children: [
        {
          pageId: "1",
          title: "Deel Vennootschapsbelasting",
          type: "overzicht",
        },
        {
          pageId: "2",
          title: "Deel Inkomstenbelasting",
          type: "overzicht",
        },
      ],
    },
    {
      title: "Tijdschiften",
      href: "/",
    },
  ],
};

const getNodeKey = ({ treeIndex }) => treeIndex;
const reducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_TREE": {
      return {
        ...state,
        treeData: action.payload.treeData,
      };
    }
    case "UPDATE_NODE": {
      let { node, path } = state.currentEditingNode;
      const { formData } = action.payload;
      return {
        ...state,
        treeData: changeNodeAtPath({
          treeData: state.treeData,
          path,
          getNodeKey,
          newNode: {
            ...node,
            ...formData,
          },
        }),
      };
    }
    case "EDIT_NODE": {
      const { currentEditingNode } = action.payload;
      return {
        ...state,
        currentEditingNode,
      };
    }
    case "REMOVE_NODE": {
      const { path } = action.payload;
      return {
        ...state,
        treeData: removeNodeAtPath({
          treeData: state.treeData,
          path,
          getNodeKey,
          ignoreCollapsed: false,
        }),
      };
    }
    case "ADD_CHILD": {
      const { path } = action.payload;
      const newTreeData = addNodeUnderParent({
        treeData: state.treeData,
        parentKey: path[path.length - 1],
        expandParent: true,
        getNodeKey,
        newNode: {
          title: `Title....`,
        },
      }).treeData;

      return {
        ...state,
        treeData: newTreeData,
      };
    }
    case "ADD_NODE": {
      const { node } = action.payload;

      return {
        ...state,
        treeData: [...state.treeData, node],
      };
    }
    default:
      return state;
  }
};

const Tree = () => {
  // const [state, setState] = useState(defaultState);
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { register, handleSubmit } = useForm();

  const onSubmit = useCallback((formData) => {
    dispatch({ type: "UPDATE_NODE", payload: { formData } });
  }, []);

  const handleEdit = useCallback((rowInfo) => {
    dispatch({
      type: "EDIT_NODE",
      payload: { currentEditingNode: rowInfo },
    });
  }, []);

  const handleRemove = useCallback((rowInfo) => {
    const { path, node } = rowInfo;
    const confirm = window.confirm(
      `Are you sure you want to delete "${node.title}"?`
    );
    if (!confirm) return;
    dispatch({ type: "REMOVE_NODE", payload: { path } });
  }, []);

  const handleAddChild = useCallback((rowInfo) => {
    const { path } = rowInfo;
    dispatch({ type: "ADD_CHILD", payload: { path } });
  }, []);

  const handleTreeChange = useCallback((treeData) => {
    dispatch({ type: "CHANGE_TREE", payload: { treeData } });
  }, []);

  const handleAddMenuItem = useCallback(() => {
    const node = {
      title: "Title...",
      href: undefined,
      pageId: undefined,
      type: undefined,
    };
    dispatch({ type: "ADD_NODE", payload: { node } });
  }, []);

  console.log(state);
  return (
    <div>
      <div style={{ height: "300px" }}>
        <SortableTree
          // theme={FileExplorerTheme}
          // nodeContentRenderer={NodeRendererCustom}
          maxDepth={2}
          canDrag={({ node, path, treeIndex }) => {
            console.log(treeIndex);
            return treeIndex !== 0;
          }}
          treeData={state.treeData}
          onChange={handleTreeChange}
          generateNodeProps={(rowInfo) => ({
            subtitle: `${rowInfo.node.href || ""} - ${
              rowInfo.node.pageId || ""
            } - ${rowInfo.node.type || ""}`,
            buttons: !rowInfo.node.isDisabled
              ? [
                  <button
                    type="button"
                    className="btn btn-sm btn-info mx-sm-1"
                    onClick={() => handleEdit(rowInfo)}
                  >
                    Edit
                  </button>,
                  <button
                    type="button"
                    className="btn btn-sm btn-danger mx-sm-1"
                    onClick={() => handleRemove(rowInfo)}
                  >
                    Remove
                  </button>,
                  <button
                    type="button"
                    className="btn btn-sm btn-primary mx-sm-1"
                    onClick={() => handleAddChild(rowInfo)}
                  >
                    Add Child
                  </button>,
                ]
              : [],
          })}
        />
      </div>
      <br />
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleAddMenuItem}
      >
        Add menu item
      </button>
      {/* {state.currentEditingNode && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ flexDirection: "column" }}>
            {JSON.stringify(state.currentEditingNode)}
            <input
              ref={register}
              style={{ fontSize: "1.1rem", width: "100%" }}
              defaultValue={state.currentEditingNode.node.title}
              name="title"
            />
            <input
              ref={register}
              style={{ fontSize: "1.1rem", width: "100%" }}
              defaultValue={state.currentEditingNode.node.href}
              name="href"
            />
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      )} */}

        {state.currentEditingNode && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ flexDirection: "column" }}>
            {/* {JSON.stringify(state.currentEditingNode)} */}
            
            <input
              {...register('title', { required: true })}
              style={{ fontSize: "1.1rem", width: "100%" }}
              defaultValue={state.currentEditingNode.node.title}
              // name="title"
            />
            {/* <input
              {...register('href', { required: true })}
              style={{ fontSize: "1.1rem", width: "100%" }}
              defaultValue={state.currentEditingNode.node.href}
              // name="href"
            /> */}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
        ) 
        }     
    </div>
  );
};
export default class App extends Component {
  render() {
    return <Tree />;
  }
}
