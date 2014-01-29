<?php
namespace V2;
 
use BaseController;
use Input;
use Customers;
use Response;
use Validator;

class CustomerController extends BaseController {

	
	/**
	*@api {GET} /api/v2/customers List customers
	*@apiName index
	*@apiGroup customers
	*@apiDescription For listing all customers.
	* 
	*@apiSuccess {object[]} products List of Customers
	*/

	public function index()
	{
		$page = Input::get('page');
		$perpage = Input::get('perPage');

		if($page!='')
			$customers = Customers::skip($perpage*($page-1))->take($perpage)->orderBy('first_name','asc')->get();
		else
			$customers = Customers::orderBy('first_name','asc')->get();

// 		$count = Customers::all()->count();

// 		return Response::json(array('customers'=>$customers->toArray(),'count'=>$count));

		return Response::json($customers);


	}


	/**
	*@api {POST} /api/v2/customers Add a customer
	*@apiName store
	*@apiGroup customers
	*@apiDescription For adding a customer
	* 
	*@apiParam {string} first_name First Name.
	*@apiParam {string} last_name  Last Name.
	*@apiParam {string} [company]   Company.
	*@apiParam {string} [phone]   Phone number
	*@apiParam {string} email   Email
	*@apiParam {string} password  Password
	*@apiParam {number} [newsletter_status]   Newsletter status ( values 1/0)
	*@apiParam {number} [account_status]   Account Status ( values 1/0)
	*
	*
	*@apiSuccess {String}  Custmoer added
	*
	*/
	public function store()
	{
			
			$rules = array('first_name'=>'required',
							'email'=>'required|unique:customers,email',
							);

			$messages = array(
				'first_name.required' => 'Fist Name required',
				'email.required' => 'Email required',
				'email.unique' => 'Email already exists'
			);

			$validator = Validator::make(Input::all(), $rules,$messages);
		
			if ($validator->fails())
			{
				$messages = $validator->messages();
				foreach ($messages->all() as $message)
				{
					$error[] = $message;
				}

				return Response::json(array(
					'error' => true,
					'err_msg' => $error),
					400
				);
			}

		    $cus_data['first_name'] = Input::get('first_name');
			$cus_data['last_name'] = Input::get('last_name');
			$cus_data['company'] = Input::get('company');
			$cus_data['phone'] = Input::get('phone');
			$cus_data['email'] = Input::get('email');
			$cus_data['password'] = Input::get('password');
			$cus_data['newsletter_status'] = Input::get('newsletter_status');
			$cus_data['account_status'] = Input::get('account_status');
			$cus_data['reg_date'] = date("Y-m-d H:i:s");

			$cus_det = Customers::create($cus_data);
			$cus_id = $cus_det->id;

		return Response::json($cus_det);
	}


	/**
	*@api {GET} /api/v2/customers/:id Customer info
	*@apiName show
	*@apiGroup customers
	*@apiDescription For getting a customer info
	* 
	*@apiSuccess {object[]} customer details array
	*/
	public function show($id)
	{
			$details = Customers::where('id',$id)->get();
			return Response::json($details);
	}

	
	/**
	*@api {PUT} /api/v2/customers/:id Edit Customer info
	*@apiName update
	*@apiGroup customers
	*@apiDescription For updating a customer info
	* 
	*@apiParam {number} id Customer id.
	*@apiParam {string} first_name First Name.
	*@apiParam {string} last_name  Last Name.
	*@apiParam {string} [company]   Company.
	*@apiParam {string} [phone]   Phone number
	*@apiParam {string} email   Email
	*@apiParam {string} password  Password
	*@apiParam {number} [newsletter_status]   Newsletter status ( values 1/0)
	*@apiParam {number} [account_status]   Account Status ( values 1/0)
	*
	*@apiSuccess {string} customer details updated
	*/
	public function update($id)
	{

	
		$rules = array('first_name'=>"required",
						'email'=>"required|unique:customers,email,$id,id",
						);

		$messages = array(
			'first_name.required' => 'Customer Name required',
			'email.required' => 'Email required',
			'email.unique' => 'Email already exists'
		);

		$validator = Validator::make(Input::all(), $rules,$messages);
	
		if ($validator->fails())
		{
			$messages = $validator->messages();
			foreach ($messages->all() as $message)
			{
				$error[] = $message;
			}

			return Response::json(array(
				'error' => true,
				'err_msg' => $error),
				400
			);
		}

		$cus_data['first_name'] = Input::get('first_name');
		$cus_data['last_name'] = Input::get('last_name');
		$cus_data['company'] = Input::get('company');
		$cus_data['phone'] = Input::get('phone');
		$cus_data['email'] = Input::get('email');
		$cus_data['password'] = Input::get('password');
		$cus_data['newsletter_status'] = Input::get('newsletter_status');
		$cus_data['account_status'] = Input::get('account_status');

		Customers::where('id',$id)->update($cus_data);
	

		$customers = Customers::find($id);
		
		return Response::json($customers);
		
	}

	/**
	*@api {DELETE} /api/v2/customers/:id Destroy Customer
	*@apiName destroy
	*@apiGroup customers
	*@apiDescription For delete a customer
	* 
	*@apiParam {number} id Customer id.
	*
	*@apiSuccess {string} customer deleted
	*/
	public function destroy($id)
	{
		$customer = Customers::where('id', $id);
 
		$customer->delete();
	
		return Response::json(array(
			'error' => false,
			'message' => 'Customer deleted'),
			200
        );
	}


}